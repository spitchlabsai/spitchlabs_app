// import { useCallback, useEffect, useState } from 'react';
// import { decodeJwt } from 'jose';
// import { ConnectionDetails } from '@/app/api/connection-details/route';

// const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

// export default function useConnectionDetails() {
//   // Generate room connection details, including:
//   //   - A random Room name
//   //   - A random Participant name
//   //   - An Access Token to permit the participant to join the room
//   //   - The URL of the LiveKit server to connect to
//   //
//   // In real-world application, you would likely allow the user to specify their
//   // own participant name, and possibly to choose from existing rooms to join.

//   const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

//   const fetchConnectionDetails = useCallback(async () => {
//     setConnectionDetails(null);
//     const url = new URL(
//       process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
//       window.location.origin
//     );

//     let data: ConnectionDetails;
//     try {
//       const res = await fetch(url.toString());
//       data = await res.json();
//     } catch (error) {
//       console.error('Error fetching connection details:', error);
//       throw new Error('Error fetching connection details!');
//     }

//     setConnectionDetails(data);
//     return data;
//   }, []);

//   useEffect(() => {
//     fetchConnectionDetails();
//   }, [fetchConnectionDetails]);

//   const isConnectionDetailsExpired = useCallback(() => {
//     const token = connectionDetails?.participantToken;
//     if (!token) {
//       return true;
//     }

//     const jwtPayload = decodeJwt(token);
//     if (!jwtPayload.exp) {
//       return true;
//     }
//     const expiresAt = new Date(jwtPayload.exp - ONE_MINUTE_IN_MILLISECONDS);

//     const now = new Date();
//     return expiresAt >= now;
//   }, [connectionDetails?.participantToken]);

//   const existingOrRefreshConnectionDetails = useCallback(async () => {
//     if (isConnectionDetailsExpired() || !connectionDetails) {
//       return fetchConnectionDetails();
//     } else {
//       return connectionDetails;
//     }
//   }, [connectionDetails, fetchConnectionDetails, isConnectionDetailsExpired]);

//   return {
//     connectionDetails,
//     refreshConnectionDetails: fetchConnectionDetails,
//     existingOrRefreshConnectionDetails,
//   };
// }


import { useCallback, useEffect, useState } from 'react';
import { decodeJwt } from 'jose';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ConnectionDetails } from '@/app/api/connection-details/route';
import { useSupabaseUser } from '@/hooks/useSupabaseUser'; // Update path if needed

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

export default function useConnectionDetails() {
  const { user, loading: userLoading } = useSupabaseUser(); // Get the authenticated user
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("Angel"); // default fallback
  const supabase = createSupabaseBrowserClient();


  useEffect(() => {
    const loadAgentName = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("agent_name")
        .eq("id", user.id)
        .single();

      if (!error && data?.agent_name) {
        setAgentName(data.agent_name);
      }
    };

    loadAgentName();
  }, [user]);



  const fetchConnectionDetails = useCallback(async (campaignId?: string) => {
    if (userLoading) {
      return null; // Wait for user loading to complete
    }

    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setConnectionDetails(null);

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
      window.location.origin
    );

    let data: ConnectionDetails;
    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          companyName: user.user_metadata?.companyName,
          agentName: agentName,
          campaignId: campaignId,
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      data = await res.json();
    } catch (error) {
      console.error('Error fetching connection details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching connection details!';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }


    console.log('Connection details received:', data);
    console.log('Participant token type:', typeof data.participantToken);
    console.log('Participant token value:', data.participantToken);


    setConnectionDetails(data);
    setIsLoading(false);
    return data;
  }, [user, userLoading]);


  useEffect(() => {
    if (!userLoading && user) {
      fetchConnectionDetails();
    }
  }, [fetchConnectionDetails, user, userLoading]);

  const isConnectionDetailsExpired = useCallback(() => {
    const token = connectionDetails?.participantToken;
    if (!token) {
      return true;
    }

    try {
      const jwtPayload = decodeJwt(token);
      if (!jwtPayload.exp) {
        return true;
      }

      // Convert exp (seconds since epoch) to milliseconds and subtract buffer
      const expiresAt = new Date((jwtPayload.exp * 1000) - ONE_MINUTE_IN_MILLISECONDS);
      const now = new Date();

      return now >= expiresAt; // Fixed the comparison logic
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return true;
    }
  }, [connectionDetails?.participantToken]);

  const existingOrRefreshConnectionDetails = useCallback(async (campaignId?: string) => {
    if (isConnectionDetailsExpired() || !connectionDetails) {
      return await fetchConnectionDetails(campaignId);
    } else {
      return connectionDetails;
    }
  }, [connectionDetails, fetchConnectionDetails, isConnectionDetailsExpired]);

  return {
    connectionDetails,
    refreshConnectionDetails: fetchConnectionDetails,
    existingOrRefreshConnectionDetails,
    isLoading: isLoading || userLoading, // Include user loading state
    error,
  };
}