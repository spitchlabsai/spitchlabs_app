import { NextResponse, NextRequest } from 'next/server'
import { AccessToken, type VideoGrant, AgentDispatchClient, RoomServiceClient } from 'livekit-server-sdk'
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol'; 

const API_KEY = process.env.LIVEKIT_API_KEY
const API_SECRET = process.env.LIVEKIT_API_SECRET
const LIVEKIT_URL = process.env.LIVEKIT_URL

export const revalidate = 0

export type ConnectionDetails = {
  serverUrl: string
  roomName: string
  participantName: string
  participantToken: string
  participantIdentity: string
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      return new NextResponse('Missing LiveKit configuration', { status: 500 })
    }

    // Get user data from request body
    const body = await request.json()
    const { userId, email, name, companyName, agentName  } = body

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    // Generate participant details
    const participantName = name || email?.split('@')[0] || `User-${userId.substring(0, 8)}`
    const participantIdentity = userId
    const roomName = `voice_assistant_room_${name}`
    
    // Create room service client for room management
    const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET)
    
    // Prepare user metadata to pass to both room and agent
    const userMetadata = {
      userId,
      email,
      name: participantName,
      companyName: companyName,
      agentName: agentName || "Angel",
      createdAt: new Date().toISOString(),
      sessionType: 'voice_assistant'
    }

    try {
      // Method 1: Create/Update room with metadata
      await roomService.createRoom({
        name: roomName,
        metadata: JSON.stringify(userMetadata),
        // Optional: Set room configuration
        maxParticipants: 10,
        emptyTimeout: 900, // x minutes
      })
      console.log('✅ Room created with metadata:', roomName)
    } catch (error: any) {
      // Room might already exist, try to update it
      if (error.message?.includes('already exists') || error.code === 'ALREADY_EXISTS') {
        try {
          await roomService.updateRoomMetadata({
            room: roomName,
            metadata: JSON.stringify(userMetadata),
          })
          console.log('✅ Room metadata updated:', roomName)
        } catch (updateError) {
          console.error('❌ Failed to update room metadata:', updateError)
        }
      } else {
        console.error('❌ Failed to create room:', error)
      }
    }

    // Create participant token
    const participantToken = await createParticipantToken({
      identity: participantIdentity,
      name: participantName,
      metadata: JSON.stringify(userMetadata),
    }, roomName);

    console.log('Generated token type:', typeof participantToken)
    console.log('Generated token value:', participantToken)

    // Method 2: Dispatch agent with metadata (you're already doing this correctly)
    const dispatchClient = new AgentDispatchClient(LIVEKIT_URL, API_KEY, API_SECRET)
    await dispatchClient.createDispatch(roomName, "my-agent", {
      metadata: JSON.stringify({
        userId,
        email,
        companyName: companyName,
        agentName: agentName || "Angel",
        joinedBy: participantIdentity,
        dispatchedAt: new Date().toISOString(),
      }),
    })

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
      participantIdentity
    }

    console.log('Generated token for user:', { userId, email, companyName,agentName, roomName, participantName })

    return NextResponse.json(data, {
      headers: { 
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}


function createParticipantToken(
  userInfo: { identity: string; name: string; metadata?: string },
  roomName: string
): string {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "1hr",
  });

  // Grant: participant can join/publish/subscribe
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  return at.toJwt();
}


