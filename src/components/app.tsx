// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { createSupabaseBrowserClient } from '@/lib/supabase/client';
// import { motion, AnimatePresence } from 'motion/react';
// import { toastAlert } from '@/components/alert-toast';
// import { Toaster } from '@/components/ui/sonner';
// import { Welcome } from '@/components/welcome';
// import type { AppConfig } from '@/lib/types';
// import { useVoiceGateway } from '@/hooks/useVoiceGateway';
// import { VoiceGatewayDashboard } from '@/components/VoiceGatewayDashboard';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Plus, X } from 'lucide-react';

// const MotionWelcome = motion.create(Welcome);

// interface AppProps {
//   appConfig: AppConfig;
// }

// interface UserProfile {
//   id: string;
//   company_name: string | null;
//   agent_name: string | null;
//   created_at: string | null;
// }

// export function App({ appConfig }: AppProps) {
//   const [activeSessions, setActiveSessions] = useState<{ id: string, campaignId?: string, name: string }[]>([]);
//   const [campaigns, setCampaigns] = useState<any[]>([]);
//   const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const supabase = createSupabaseBrowserClient();

//   useEffect(() => {
//     const fetchProfileAndCampaigns = async () => {
//       setIsLoading(true);

//       try {
//         // Get authenticated user
//         const { data: { user }, error: authError } = await supabase.auth.getUser();

//         if (authError || !user) {
//           console.error("Auth error:", authError);
//           setIsLoading(false);
//           return;
//         }

//         // Fetch profile from profiles table
//         const { data: profileData, error: profileError } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('id', user.id)
//           .single();

//         if (profileError) {
//           console.error("Profile fetch error:", profileError);
//           // Profile might not exist yet, create a default one
//           console.log("Profile not found, user may need to complete setup");
//         } else {
//           setUserProfile(profileData);
//           console.log("Profile loaded:", profileData);
//         }

//         // Fetch campaigns
//         try {
//           const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//           const response = await fetch(`${API_BASE}/campaigns/${user.id}`);

//           if (response.ok) {
//             const data = await response.json();
//             setCampaigns(data);
//             if (data.length > 0) {
//               setSelectedCampaignId(data[0].id);
//             }
//             console.log("Campaigns loaded:", data.length);
//           } else {
//             console.error("Failed to fetch campaigns:", response.status);
//           }
//         } catch (error) {
//           console.error("Failed to fetch campaigns:", error);
//         }
//       } catch (error) {
//         console.error("Unexpected error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfileAndCampaigns();
//   }, [supabase]);

//   const handleStartSession = () => {
//     const campaign = campaigns.find(c => c.id === selectedCampaignId);
//     const newSession = {
//       id: Math.random().toString(36).substring(7),
//       campaignId: selectedCampaignId,
//       name: campaign ? campaign.name : "New Session"
//     };
//     setActiveSessions(prev => [...prev, newSession]);
//   };

//   const removeSession = (id: string) => {
//     setActiveSessions(prev => prev.filter(s => s.id !== id));
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-bg0">
//         <div className="text-fg1">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-bg0 text-fg1">
//       <header className="p-4 border-b border-border0 flex items-center justify-between bg-bg1 sticky top-0 z-50">
//         <h1 className="text-xl font-bold font-mono tracking-tighter">
//           SPITCHLABS <span className="text-primary">VOICE GATEWAY</span>
//         </h1>
//         <div className="flex items-center gap-4">
//           {userProfile && (
//             <div className="text-xs font-mono text-fg1/60">
//               {userProfile.agent_name || 'Agent'} @ {userProfile.company_name || 'Company'}
//             </div>
//           )}
//           <select
//             className="bg-bg0 border border-border0 rounded px-2 py-1 text-xs font-mono"
//             value={selectedCampaignId}
//             onChange={(e) => setSelectedCampaignId(e.target.value)}
//           >
//             {campaigns.length === 0 ? (
//               <option>No campaigns</option>
//             ) : (
//               campaigns.map(c => (
//                 <option key={c.id} value={c.id}>{c.name}</option>
//               ))
//             )}
//           </select>
//           <Button
//             size="sm"
//             onClick={handleStartSession}
//             className="gap-2"
//             disabled={!userProfile || campaigns.length === 0}
//           >
//             <Plus className="w-4 h-4" /> TEST CAMPAIGN
//           </Button>
//         </div>
//       </header>

//       <main className="flex-1 p-4">
//         {activeSessions.length === 0 ? (
//           <div className="h-[70vh] flex items-center justify-center">
//             <MotionWelcome
//               key="welcome"
//               startButtonText="Start First Test"
//               onStartCall={handleStartSession}
//               disabled={!userProfile || campaigns.length === 0}
//               campaigns={campaigns}
//               selectedCampaignId={selectedCampaignId}
//               onCampaignChange={setSelectedCampaignId}
//             />
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-8">
//             <AnimatePresence>
//               {activeSessions.map((session) => (
//                 <SessionContainer
//                   key={session.id}
//                   session={session}
//                   onClose={() => removeSession(session.id)}
//                   userProfile={userProfile}
//                 />
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </main>
//       <Toaster />
//     </div>
//   );
// }

// function SessionContainer({
//   session,
//   onClose,
//   userProfile
// }: {
//   session: any;
//   onClose: () => void;
//   userProfile: UserProfile | null;
// }) {
//   const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "ws://localhost:8000/ws/voice";
//   const gateway = useVoiceGateway(GATEWAY_URL);

//   useEffect(() => {
//     gateway.connect();
//     return () => gateway.disconnect();
//   }, []);

//   const handleStart = () => {
//     if (!userProfile) {
//       console.error("Cannot start session: userProfile is null");
//       return;
//     }

//     const config = {
//       userId: userProfile.id,
//       campaignId: session.campaignId,
//       agentName: userProfile.agent_name || "AI Agent",
//       companyName: userProfile.company_name || "Your Company"
//     };

//     console.log("Starting session with config:", config);
//     gateway.startSession(config);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       className="relative"
//     >
//       <div className="absolute right-6 top-6 z-10">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onClose}
//           className="hover:bg-destructive/10 hover:text-destructive"
//         >
//           <X className="w-5 h-5" />
//         </Button>
//       </div>
//       <Card className="bg-bg1 border-border0 overflow-hidden">
//         <div className="p-4 border-b border-border0 bg-bg1/50 flex items-center gap-4">
//           <Badge variant="outline">{session.name}</Badge>
//           {!gateway.isSessionActive && (
//             <Button
//               size="sm"
//               onClick={handleStart}
//               disabled={!gateway.isConnected || !userProfile}
//             >
//               START VOICE SESSION
//             </Button>
//           )}
//           {gateway.isSessionActive && !gateway.isMicrophoneActive && (
//             <Button size="sm" variant="success" onClick={gateway.startMicrophone}>
//               START MIC
//             </Button>
//           )}
//           {gateway.isMicrophoneActive && (
//             <Button size="sm" variant="destructive" onClick={gateway.stopMicrophone}>
//               STOP MIC
//             </Button>
//           )}
//         </div>
//         <VoiceGatewayDashboard gateway={gateway} title={session.name} />
//       </Card>
//     </motion.div>
//   );
// }






'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'motion/react';
import { toastAlert } from '@/components/alert-toast';
import { Toaster } from '@/components/ui/sonner';
import { Welcome } from '@/components/welcome';
import type { AppConfig } from '@/lib/types';
import { useVoiceGateway } from '@/hooks/useVoiceGateway';
import { VoiceGatewayDashboard } from '@/components/VoiceGatewayDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const MotionWelcome = motion.create(Welcome);

interface AppProps {
  appConfig: AppConfig;
}

interface UserProfile {
  id: string;
  company_name: string | null;
  agent_name: string | null;
  created_at: string | null;
}

export function App({ appConfig }: AppProps) {
  const [activeSessions, setActiveSessions] = useState<{ id: string, campaignId?: string, name: string }[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchProfileAndCampaigns = async () => {
      setIsLoading(true);

      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Auth error:", authError);
          setIsLoading(false);
          return;
        }

        // Fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          console.log("Profile not found, user may need to complete setup");
        } else {
          setUserProfile(profileData);
          console.log("Profile loaded:", profileData);
        }

        // Fetch campaigns
        setIsFetchingCampaigns(true);
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const response = await fetch(`${API_BASE}/campaigns/${user.id}`);

          if (response.ok) {
            const data = await response.json();
            setCampaigns(data);
            if (data.length > 0) {
              setSelectedCampaignId(data[0].id);
            }
            console.log("Campaigns loaded:", data.length);
          } else {
            console.error("Failed to fetch campaigns:", response.status);
          }
        } catch (error) {
          console.error("Failed to fetch campaigns:", error);
        } finally {
          setIsFetchingCampaigns(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCampaigns();
  }, [supabase]);

  const handleStartSession = () => {
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    const newSession = {
      id: Math.random().toString(36).substring(7),
      campaignId: selectedCampaignId,
      name: campaign ? campaign.name : "New Session"
    };
    setActiveSessions(prev => [...prev, newSession]);
  };

  const removeSession = (id: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-fg1 font-mono text-sm">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg0 text-fg1">
      <header className="p-4 border-b border-border0 flex items-center justify-between bg-bg1 sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold font-mono tracking-tighter">
          SPITCHLABS <span className="text-primary">VOICE GATEWAY</span>
        </h1>
        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="text-xs font-mono text-fg1/60 bg-bg0 px-3 py-1 rounded-md border border-border0">
              👤 {userProfile.agent_name || 'Agent'} @ {userProfile.company_name || 'Company'}
            </div>
          )}
          {isFetchingCampaigns ? (
            <div className="flex items-center gap-2 text-xs text-fg1/60">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading campaigns...
            </div>
          ) : (
            <select
              className="bg-bg0 border border-border0 rounded px-3 py-1.5 text-xs font-mono hover:border-primary/50 transition-colors"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              disabled={campaigns.length === 0}
            >
              {campaigns.length === 0 ? (
                <option>No campaigns</option>
              ) : (
                campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          )}
          <Button
            size="sm"
            onClick={handleStartSession}
            className="gap-2"
            disabled={!userProfile || campaigns.length === 0 || isFetchingCampaigns}
          >
            <Plus className="w-4 h-4" /> TEST CAMPAIGN
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        {activeSessions.length === 0 ? (
          <div className="h-[70vh] flex items-center justify-center">
            <MotionWelcome
              key="welcome"
              startButtonText="Start First Test"
              onStartCall={handleStartSession}
              disabled={!userProfile || campaigns.length === 0 || isFetchingCampaigns}
              campaigns={campaigns}
              selectedCampaignId={selectedCampaignId}
              onCampaignChange={setSelectedCampaignId}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {activeSessions.map((session) => (
                <SessionContainer
                  key={session.id}
                  session={session}
                  onClose={() => removeSession(session.id)}
                  userProfile={userProfile}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

function SessionContainer({
  session,
  onClose,
  userProfile
}: {
  session: any;
  onClose: () => void;
  userProfile: UserProfile | null;
}) {
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "ws://localhost:8000/ws/voice";
  const gateway = useVoiceGateway(GATEWAY_URL);
  const [isStarting, setIsStarting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    gateway.connect();
    return () => gateway.disconnect();
  }, []);

  const handleStart = async () => {
    if (!userProfile) {
      console.error("Cannot start session: userProfile is null");
      return;
    }

    setIsStarting(true);

    try {
      const config = {
        userId: userProfile.id,
        campaignId: session.campaignId,
        agentName: userProfile.agent_name || "AI Agent",
        companyName: userProfile.company_name || "Your Company"
      };

      console.log("Starting session with config:", config);
      await gateway.startSession(config);
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const toggleMicMute = () => {
    setIsMicMuted(!isMicMuted);
    // You would implement actual muting logic here
    // This depends on your audio stream implementation
    console.log(`Microphone ${!isMicMuted ? 'muted' : 'unmuted'}`);
  };

  const toggleSpeakerMute = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    // You would implement actual speaker muting logic here
    console.log(`Speaker ${!isSpeakerMuted ? 'muted' : 'unmuted'}`);
  };

  const getConnectionStatus = () => {
    if (!gateway.isConnected) {
      return { text: 'Disconnected', color: 'bg-red-500' };
    }
    if (!gateway.isSessionActive) {
      return { text: 'Connected', color: 'bg-yellow-500' };
    }
    return { text: 'Active', color: 'bg-green-500' };
  };

  const status = getConnectionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative"
    >
      <div className="absolute right-6 top-6 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      <Card className="bg-bg1 border-border0 overflow-hidden">
        <div className="p-4 border-b border-border0 bg-bg1/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="font-mono">
                {session.name}
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
                <span className="text-xs font-mono text-fg1/60">{status.text}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Start Session Button */}
              {!gateway.isSessionActive && (
                <Button
                  size="sm"
                  onClick={handleStart}
                  disabled={!gateway.isConnected || !userProfile || isStarting}
                  className="gap-2"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'START VOICE SESSION'
                  )}
                </Button>
              )}

              {/* Microphone Controls */}
              {gateway.isSessionActive && (
                <>
                  {!gateway.isMicrophoneActive ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={gateway.startMicrophone}
                      className="gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      START MIC
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant={isMicMuted ? "secondary" : "outline"}
                        onClick={toggleMicMute}
                        className="gap-2"
                      >
                        {isMicMuted ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            UNMUTE MIC
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            MUTE MIC
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant={isSpeakerMuted ? "secondary" : "outline"}
                        onClick={toggleSpeakerMute}
                        className="gap-2"
                      >
                        {isSpeakerMuted ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            UNMUTE
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            MUTE
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={gateway.stopMicrophone}
                        className="gap-2"
                      >
                        <MicOff className="w-4 h-4" />
                        STOP MIC
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {isStarting && (
            <div className="mt-3 flex items-center gap-2 text-xs text-fg1/60 bg-bg0 p-2 rounded">
              <Loader2 className="w-3 h-3 animate-spin" />
              Initializing voice session...
            </div>
          )}

          {!gateway.isConnected && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Gateway disconnected. Attempting to reconnect...
            </div>
          )}

          {isMicMuted && gateway.isMicrophoneActive && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
              🔇 Your microphone is muted
            </div>
          )}

          {isSpeakerMuted && gateway.isSessionActive && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
              🔇 Speaker output is muted
            </div>
          )}
        </div>
        <VoiceGatewayDashboard gateway={gateway} title={session.name} />
      </Card>
    </motion.div>
  );
}