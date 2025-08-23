# enhanced_livekit_agent.py
import os
import asyncio
import json
from typing import Dict, Any
from dotenv import load_dotenv
import websockets
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, JobContext
from livekit.plugins import spitch, assemblyai, google, noise_cancellation, silero
from vector_search import VectorSearchService

load_dotenv()

class SalesAgent(Agent):
    def __init__(self, user_id: str, vector_service: VectorSearchService) -> None:
        self.user_id = user_id
        self.vector_service = vector_service
        base_instructions = """You are a highly persuasive AI sales agent. 
        Your job is not just to answer questions, but to actively **convince, market, and persuade** the client.
        
        Guidelines:
        1. Always ground your sales pitch in the business knowledge uploaded to the knowledge base.
        2. Frame responses as persuasive marketing communications, not neutral answers.
        3. Highlight benefits, value propositions, and unique selling points found in the documents.
        4. If no relevant context is available, default to powerful general sales strategies and marketing language.
        5. Always speak confidently, naturally, and in a convincing manner — your goal is to move the client toward a "yes"."""
        super().__init__(instructions=base_instructions)

    async def get_enhanced_instructions(self, query: str) -> str:
        """Get persuasive sales instructions with relevant context from the knowledge base"""
        try:
            context = await self.vector_service.get_relevant_context(query, self.user_id)
            if context:
                enhanced_instructions = f"""You are a persuasive AI sales agent whose mission is to market and convince.
                
RELEVANT BUSINESS CONTEXT:
{context}

Based on this context and the client's query:
- Craft your response as a persuasive sales pitch.
- Emphasize the benefits, advantages, and unique value of the offering.
- Tie your persuasion directly to the uploaded business info whenever possible.
- Speak with confidence and marketing flair. Position the product/service as the best possible choice for the client.
- If the context is weak or missing, still respond with powerful, general persuasive sales language.

Your goal is to **win over the client** with every interaction, not just assist them."""
                return enhanced_instructions
            return self.instructions
        except Exception as e:
            print(f"Error getting enhanced instructions: {str(e)}")
            return self.instructions


class EnhancedAgentService:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.vector_service = VectorSearchService(supabase_url, supabase_key)
        self.active_sessions: Dict[str, AgentSession] = {}
        self.websocket_clients: Dict[str, set] = {}  # Track connected WebSocket clients per session

    async def create_agent_session(self, user_id: str, room_name: str) -> AgentSession:
        """Create a new agent session for a user"""
        try:
            assistant = SalesAgent(user_id, self.vector_service)
            session = AgentSession(
                turn_detection="stt",
                stt=assemblyai.STT(
                    end_of_turn_confidence_threshold=0.7,
                    min_end_of_turn_silence_when_confident=160,
                    max_turn_silence=2400,
                ),
                vad=silero.VAD.load(),
                llm=google.LLM(model="gemini-2.0-flash-exp"),
                tts=spitch.TTS(language="en", voice="lina"),
            )
            session_key = f"{user_id}_{room_name}"
            self.active_sessions[session_key] = session
            self.websocket_clients[session_key] = set()  # Initialize WebSocket client set
            return session
        except Exception as e:
            print(f"Error creating agent session: {str(e)}")
            raise

    async def start_agent_session(self, ctx: JobContext, user_id: str, room_name: str):
        """Start agent session with knowledge base context"""
        try:
            session_key = f"{user_id}_{room_name}"
            if session_key not in self.active_sessions:
                session = await self.create_agent_session(user_id, room_name)
            else:
                session = self.active_sessions[session_key]

            assistant = SalesAgent(user_id, self.vector_service)

            async def enhanced_generate_reply(message: str, **kwargs):
                enhanced_instructions = await assistant.get_enhanced_instructions(message)
                session._llm._instructions = enhanced_instructions
                response = await session.generate_reply(instructions=enhanced_instructions, **kwargs)
                # Broadcast response to connected WebSocket clients
                await self.broadcast_to_clients(session_key, {"type": "agent_response", "message": response})
                return response

            session.enhanced_generate_reply = enhanced_generate_reply

            await session.start(
                room=ctx.room,
                agent=assistant,
                room_input_options=RoomInputOptions(noise_cancellation=noise_cancellation.BVC()),
            )

            kb_summary = await self.vector_service.get_user_knowledge_summary(user_id)
            greeting = f"""
Good morning Chima, this is Alex calling from FreshSteps Shoes. 
I was reviewing our notes and I see you’ve shown interest in {kb_summary['total_documents']} of our shoe collections, 
with {kb_summary['total_chunks']} different styles and sizes we can recommend for you. 

I wanted to reach out personally — are you currently looking to upgrade your footwear, 
or would you like me to walk you through some of our best sellers?
"""
            response = await session.generate_reply(instructions=greeting)
            # Broadcast greeting to connected WebSocket clients
            await self.broadcast_to_clients(session_key, {"type": "agent_response", "message": response})
            return session
        except Exception as e:
            print(f"Error starting agent session: {str(e)}")
            await self.broadcast_to_clients(session_key, {"type": "error", "message": str(e)})
            raise

    async def stop_agent_session(self, user_id: str, room_name: str):
        """Stop an agent session"""
        session_key = f"{user_id}_{room_name}"
        if session_key in self.active_sessions:
            try:
                session = self.active_sessions[session_key]
                await session.stop()
                del self.active_sessions[session_key]
                await self.broadcast_to_clients(session_key, {"type": "session_stopped", "message": "Session stopped successfully"})
                del self.websocket_clients[session_key]
                return True
            except Exception as e:
                print(f"Error stopping agent session: {str(e)}")
                await self.broadcast_to_clients(session_key, {"type": "error", "message": str(e)})
                return False
        await self.broadcast_to_clients(session_key, {"type": "error", "message": "Session not found"})
        return False

    async def broadcast_to_clients(self, session_key: str, message: Dict[str, Any]):
        """Broadcast a message to all WebSocket clients connected to a session"""
        if session_key in self.websocket_clients:
            disconnected_clients = set()
            for client in self.websocket_clients[session_key]:
                try:
                    await client.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
            # Remove disconnected clients
            self.websocket_clients[session_key].difference_update(disconnected_clients)

    async def handle_websocket(self, websocket, path):
        """Handle WebSocket client commands"""
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    command = data.get("command")
                    user_id = data.get("user_id")
                    room_name = data.get("room_name")
                    session_key = f"{user_id}_{room_name}"

                    if not all([command, user_id, room_name]):
                        await websocket.send(json.dumps({"type": "error", "message": "Missing command, user_id, or room_name"}))
                        continue

                    # Register client to session
                    if session_key not in self.websocket_clients:
                        self.websocket_clients[session_key] = set()
                    self.websocket_clients[session_key].add(websocket)

                    if command == "start_session":
                        ctx = data.get("job_context")  # Client must provide serialized JobContext or equivalent
                        if not ctx:
                            await websocket.send(json.dumps({"type": "error", "message": "JobContext required for start_session"}))
                            continue
                        # Convert ctx to JobContext (simplified; you may need to adapt based on LiveKit's API)
                        ctx = agents.JobContext(**ctx)
                        await self.start_agent_session(ctx, user_id, room_name)
                        await websocket.send(json.dumps({"type": "session_started", "message": "Session started successfully"}))

                    elif command == "stop_session":
                        success = await self.stop_agent_session(user_id, room_name)
                        if not success:
                            await websocket.send(json.dumps({"type": "error", "message": "Failed to stop session"}))

                    elif command == "send_message":
                        message = data.get("message")
                        if not message:
                            await websocket.send(json.dumps({"type": "error", "message": "Message required for send_message"}))
                            continue
                        session_key = f"{user_id}_{room_name}"
                        if session_key in self.active_sessions:
                            session = self.active_sessions[session_key]
                            await session.enhanced_generate_reply(message)
                        else:
                            await websocket.send(json.dumps({"type": "error", "message": "Session not found"}))

                    elif command == "get_sessions":
                        sessions = self.get_active_sessions()
                        await websocket.send(json.dumps({"type": "sessions", "data": sessions}))

                    else:
                        await websocket.send(json.dumps({"type": "error", "message": "Unknown command"}))

                except json.JSONDecodeError:
                    await websocket.send(json.dumps({"type": "error", "message": "Invalid JSON"}))
                except Exception as e:
                    await websocket.send(json.dumps({"type": "error", "message": str(e)}))
        except websockets.exceptions.ConnectionClosed:
            # Remove client from all sessions
            for session_key in self.websocket_clients:
                self.websocket_clients[session_key].discard(websocket)

    def get_active_sessions(self) -> Dict[str, Any]:
        """Get information about active sessions"""
        return {
            "active_sessions": list(self.active_sessions.keys()),
            "total_active": len(self.active_sessions),
        }


async def entrypoint(ctx: JobContext):
    """Top-level entrypoint (Windows-safe)."""
    global agent_service
    print(f"Entrypoint called with job ID: {ctx.job.id}")
    # Entrypoint does minimal work; waits for client commands via WebSocket
    if agent_service is None:
        raise RuntimeError("Agent service not initialized")


async def start_websocket_server(agent_service_instance: EnhancedAgentService):
    """Start WebSocket server for client commands"""
    async with websockets.serve(agent_service_instance.handle_websocket, "0.0.0.0", 8765):
        print("WebSocket server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not all([SUPABASE_URL, SUPABASE_KEY]):
        raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

    agent_service = EnhancedAgentService(SUPABASE_URL, SUPABASE_KEY)

    # Run WebSocket server and LiveKit worker concurrently
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.gather(
        start_websocket_server(agent_service),
        agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
    ))