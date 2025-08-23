# # enhanced_livekit_agent.py
# import os
# import asyncio
# from typing import Dict, Any
# from dotenv import load_dotenv

# from livekit import agents
# from livekit.agents import AgentSession, Agent, RoomInputOptions, JobContext
# from livekit.plugins import (
#     spitch,
#     assemblyai,
#     google,
#     noise_cancellation,
#     silero,
# )

# from vector_search import VectorSearchService

# load_dotenv()


# class SalesAgent(Agent):
#     def __init__(self, user_id: str, vector_service: VectorSearchService) -> None:
#         self.user_id = user_id
#         self.vector_service = vector_service

#         # Core instructions for the persuasive sales AI
#         base_instructions = """You are a highly persuasive AI sales agent. 
#         Your job is not just to answer questions, but to actively **convince, market, and persuade** the client.
        
#         Guidelines:
#         1. Always ground your sales pitch in the business knowledge uploaded to the knowledge base.
#         2. Frame responses as persuasive marketing communications, not neutral answers.
#         3. Highlight benefits, value propositions, and unique selling points found in the documents.
#         4. If no relevant context is available, default to powerful general sales strategies and marketing language.
#         5. Always speak confidently, naturally, and in a convincing manner — your goal is to move the client toward a "yes"."""

#         super().__init__(instructions=base_instructions)

#     async def get_enhanced_instructions(self, query: str) -> str:
#         """Get persuasive sales instructions with relevant context from the knowledge base"""
#         try:
#             context = await self.vector_service.get_relevant_context(query, self.user_id)

#             if context:
#                 enhanced_instructions = f"""You are a persuasive AI sales agent whose mission is to market and convince.
                
# RELEVANT BUSINESS CONTEXT:
# {context}

# Based on this context and the client's query:
# - Craft your response as a persuasive sales pitch.
# - Emphasize the benefits, advantages, and unique value of the offering.
# - Tie your persuasion directly to the uploaded business info whenever possible.
# - Speak with confidence and marketing flair. Position the product/service as the best possible choice for the client.
# - If the context is weak or missing, still respond with powerful, general persuasive sales language.

# Your goal is to **win over the client** with every interaction, not just assist them."""
#                 return enhanced_instructions
#             else:
#                 return self.instructions

#         except Exception as e:
#             print(f"Error getting enhanced instructions: {str(e)}")
#             return self.instructions


# class EnhancedAgentService:
#     def __init__(self, supabase_url: str, supabase_key: str):
#         self.vector_service = VectorSearchService(supabase_url, supabase_key)
#         self.active_sessions: Dict[str, AgentSession] = {}

#     async def create_agent_session(self, user_id: str, room_name: str) -> AgentSession:
#         """Create a new agent session for a user"""
#         try:
#             assistant = SalesAgent(user_id, self.vector_service)

#             session = AgentSession(
#                 turn_detection="stt",
#                 stt=assemblyai.STT(
#                     end_of_turn_confidence_threshold=0.7,
#                     min_end_of_turn_silence_when_confident=160,
#                     max_turn_silence=2400,
#                 ),
#                 vad=silero.VAD.load(),
#                 llm=google.LLM(
#                     model="gemini-2.0-flash-exp",
#                 ),
#                 tts=spitch.TTS(
#                     language="en",
#                     voice="lina",
#                 ),
#             )

#             self.active_sessions[f"{user_id}_{room_name}"] = session
#             return session

#         except Exception as e:
#             print(f"Error creating agent session: {str(e)}")
#             raise

#     async def start_agent_session(self, ctx: agents.JobContext, user_id: str):
#         """Start agent session with knowledge base context"""
#         try:
#             session = await self.create_agent_session(user_id, ctx.room.name)
#             assistant = SalesAgent(user_id, self.vector_service)

#             async def enhanced_generate_reply(message: str, **kwargs):
#                 enhanced_instructions = await assistant.get_enhanced_instructions(message)
#                 session._llm._instructions = enhanced_instructions
#                 return await session.generate_reply(instructions=enhanced_instructions, **kwargs)

#             session.enhanced_generate_reply = enhanced_generate_reply

#             await session.start(
#                 room=ctx.room,
#                 agent=assistant,
#                 room_input_options=RoomInputOptions(
#                     noise_cancellation=noise_cancellation.BVC(),
#                 ),
#             )

#             kb_summary = await self.vector_service.get_user_knowledge_summary(user_id)

#             greeting = f"""
# Good morning Chima, this is Alex calling from FreshSteps Shoes. 
# I was reviewing our notes and I see you’ve shown interest in {kb_summary['total_documents']} of our shoe collections, 
# with {kb_summary['total_chunks']} different styles and sizes we can recommend for you. 

# I wanted to reach out personally — are you currently looking to upgrade your footwear, 
# or would you like me to walk you through some of our best sellers?
# """

#             await session.generate_reply(instructions=greeting)
#             return session

#         except Exception as e:
#             print(f"Error starting agent session: {str(e)}")
#             raise

#     async def stop_agent_session(self, user_id: str, room_name: str):
#         """Stop an agent session"""
#         session_key = f"{user_id}_{room_name}"
#         if session_key in self.active_sessions:
#             try:
#                 session = self.active_sessions[session_key]
#                 await session.stop()
#                 del self.active_sessions[session_key]
#                 return True
#             except Exception as e:
#                 print(f"Error stopping agent session: {str(e)}")
#                 return False
#         return False

#     def get_active_sessions(self) -> Dict[str, Any]:
#         """Get information about active sessions"""
#         return {
#             "active_sessions": list(self.active_sessions.keys()),
#             "total_active": len(self.active_sessions),
#         }


# # ---------------------------
# # ✅ Windows-safe entrypoint
# # ---------------------------

# agent_service: EnhancedAgentService | None = None
# USER_ID: str | None = None

# # @agents.register
# async def entrypoint(ctx: agents.JobContext):
#     await ctx.connect()
#     """Top-level entrypoint (Windows-safe)."""
#     global agent_service, USER_ID
#     print(ctx.job)
#     print(ctx.room)
#     print("============ctx========",ctx.job.id, ctx.room.metadata)
#     # participant = ctx.participant
#     if ctx.job.metadata:
#         import json
#         metadata = json.loads(ctx.job.metadata)
#         USER_ID = metadata.get("userId")
#         email = metadata.get("email")
#         print("Agent got metadata:", metadata)
#     if agent_service is None or USER_ID is None:
#         raise RuntimeError("Agent service or USER_ID not initialized")
#     await agent_service.start_agent_session(ctx, USER_ID)


# if __name__ == "__main__":
#     # USER_ID = os.getenv("USER_ID", "default_user")
#     SUPABASE_URL = os.getenv("SUPABASE_URL")
#     SUPABASE_KEY = os.getenv("SUPABASE_KEY")

#     if not all([SUPABASE_URL, SUPABASE_KEY]):
#         raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

#     agent_service = EnhancedAgentService(SUPABASE_URL, SUPABASE_KEY)

#     agents.cli.run_app(
#         agents.WorkerOptions(entrypoint_fnc=entrypoint )
#     )



# enhanced_livekit_agent.py
import os
import json
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import JobContext, WorkerOptions, cli, Agent, AutoSubscribe, AgentSession
from livekit.plugins import (
    spitch,
    assemblyai,
    google,
    noise_cancellation,
    silero,
)

from vector_search import VectorSearchService

load_dotenv()


class SalesAgent(Agent):
    def __init__(self, user_context: Dict[str, Any], vector_service: VectorSearchService) -> None:
        self.user_context = user_context
        self.user_id = user_context.get("userId", "unknown")
        self.user_name = user_context.get("name", "there")
        self.user_email = user_context.get("email", "")
        self.vector_service = vector_service

        # Core instructions for the persuasive sales AI
        self.base_instructions = f"""You are a highly persuasive AI sales agent named Alex from FreshSteps Shoes. 
        You are speaking with {self.user_name} (email: {self.user_email}).
        
        Your job is not just to answer questions, but to actively **convince, market, and persuade** the client.
        
        Guidelines:
        1. Always ground your sales pitch in the business knowledge uploaded to the knowledge base.
        2. Frame responses as persuasive marketing communications, not neutral answers.
        3. Highlight benefits, value propositions, and unique selling points found in the documents.
        4. If no relevant context is available, default to powerful general sales strategies and marketing language.
        5. Always speak confidently, naturally, and in a convincing manner — your goal is to move the client toward a "yes".
        6. Use the client's name ({self.user_name}) naturally in conversation to build rapport."""
        super().__init__(instructions=self.base_instructions)

    async def get_enhanced_instructions(self, query: str) -> str:
        """Get persuasive sales instructions with relevant context from the knowledge base"""
        try:
            context = await self.vector_service.get_relevant_context(query, self.user_id)

            if context:
                enhanced_instructions = f"""You are Alex, a persuasive AI sales agent from FreshSteps Shoes speaking with {self.user_name}.
                
RELEVANT BUSINESS CONTEXT:
{context}

Based on this context and {self.user_name}'s query:
- Craft your response as a persuasive sales pitch.
- Emphasize the benefits, advantages, and unique value of the offering.
- Tie your persuasion directly to the uploaded business info whenever possible.
- Speak with confidence and marketing flair. Position the product/service as the best possible choice for {self.user_name}.
- If the context is weak or missing, still respond with powerful, general persuasive sales language.

Your goal is to **win over {self.user_name}** with every interaction, not just assist them."""
                return enhanced_instructions
            else:
                return self.base_instructions

        except Exception as e:
            print(f"Error getting enhanced instructions: {str(e)}")
            return self.base_instructions


class EnhancedAgentService:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.vector_service = VectorSearchService(supabase_url, supabase_key)
        self.active_sessions: Dict[str, AgentSession] = {}

    async def create_agent_session(self, user_context: Dict[str, Any]) -> AgentSession:
        """Create a new agent session for a user"""
        try:
            user_name = user_context.get("name", "there")
            
            # Get knowledge base summary for personalized greeting
            try:
                kb_summary = await self.vector_service.get_user_knowledge_summary(user_context["userId"])
                kb_info = f"You have {kb_summary.get('total_documents', 0)} documents and {kb_summary.get('total_chunks', 0)} product details in your knowledge base."
            except Exception as e:
                print(f"Warning: Could not get KB summary: {e}")
                kb_info = "I have access to our complete product catalog."

           
            session = AgentSession(
                turn_detection="stt",
                stt=assemblyai.STT(
                    end_of_turn_confidence_threshold=0.7,
                    min_end_of_turn_silence_when_confident=160,
                    max_turn_silence=2400,
                ),
                vad=silero.VAD.load(),
                llm=google.LLM(
                    model="gemini-2.0-flash-exp",
                ),
                tts=spitch.TTS(
                    language="en",
                    voice="lina",
                ),
            )

            # Store the sales agent for enhanced context retrieval
            session._sales_agent = SalesAgent(user_context, self.vector_service)
            
            return session

        except Exception as e:
            print(f"Error creating agent session: {str(e)}")
            raise

    async def start_agent_session(self, ctx: JobContext, user_context: Dict[str, Any]):
        """Start agent session with knowledge base context"""
        try:
            user_id = user_context.get("userId")
            user_name = user_context.get("name", "there")
            
            print(f"🤖 Starting agent session for user: {user_name} (ID: {user_id})")

            # Create agent session
            session = await self.create_agent_session(user_context)
            sales_agent = session._sales_agent
            
            # Store active session
            session_key = f"{user_id}_{ctx.room.name}"
            self.active_sessions[session_key] = session

            # Enhanced message handling with context retrieval
            original_llm = session._llm

            async def enhanced_generate_reply(message: str, **kwargs):
                try:
                    # Get enhanced instructions with vector context
                    enhanced_instructions = await sales_agent.get_enhanced_instructions(message)
                    
                    # Update LLM instructions
                    original_llm._instructions = enhanced_instructions
                    
                    print(f"💬 Processing message with enhanced context: {message[:50]}...")
                    
                    # Call the original generate_reply with enhanced instructions
                    return await session.generate_reply(instructions=enhanced_instructions, **kwargs)
                    
                except Exception as e:
                    print(f"Error in enhanced reply generation: {e}")
                    return await session.generate_reply(instructions=sales_agent.base_instructions, **kwargs)

            # Replace the session's generate_reply method
            session.enhanced_generate_reply = enhanced_generate_reply

            # Start the session
            from livekit.agents import RoomInputOptions
            await session.start(
                room=ctx.room,
                agent=sales_agent,
                room_input_options=RoomInputOptions(
                    noise_cancellation=noise_cancellation.BVC(),
                ),
            )
            
            # Generate personalized greeting
            await self._send_personalized_greeting(user_context, session)
            
            print(f"✅ Agent session started successfully for {user_name}")
            return session

        except Exception as e:
            print(f"❌ Error starting agent session: {str(e)}")
            raise

    async def _send_personalized_greeting(self, user_context: Dict[str, Any], session: AgentSession):
        """Send a personalized greeting based on user data and knowledge base"""
        try:
            user_name = user_context.get("name", "there")
            user_id = user_context.get("userId")
            
            # Get knowledge base summary
            try:
                kb_summary = await self.vector_service.get_user_knowledge_summary(user_id)
                total_docs = kb_summary.get('total_documents', 0)
                total_chunks = kb_summary.get('total_chunks', 0)
                
                if total_docs > 0:
                    kb_context = f"I see you've shown interest in {total_docs} of our shoe collections, with {total_chunks} different styles and options available for you."
                else:
                    kb_context = "I have our complete catalog of premium footwear ready to show you."
                    
            except Exception as e:
                print(f"Warning: Could not get KB summary for greeting: {e}")
                kb_context = "I'm excited to help you find the perfect shoes today."

            greeting = f"""Good day {user_name}, this is Alex calling from FreshSteps Shoes! 
            
            {kb_context}
            
            I wanted to reach out personally because I believe we have exactly what you're looking for. 
            Are you currently in the market for some premium footwear, or would you like me to show you some of our bestselling styles that I think would be perfect for you?"""

            # Generate the greeting using the session
            await session.generate_reply(instructions=greeting)
            
            print(f"💬 Sent personalized greeting to {user_name}")

        except Exception as e:
            print(f"Error sending greeting: {e}")

    async def stop_agent_session(self, user_id: str, room_name: str):
        """Stop an agent session"""
        session_key = f"{user_id}_{room_name}"
        if session_key in self.active_sessions:
            try:
                session = self.active_sessions[session_key]
                await session.stop()
                del self.active_sessions[session_key]
                print(f"✅ Stopped agent session: {session_key}")
                return True
            except Exception as e:
                print(f"❌ Error stopping agent session: {str(e)}")
                return False
        return False

    def get_active_sessions(self) -> Dict[str, Any]:
        """Get information about active sessions"""
        return {
            "active_sessions": list(self.active_sessions.keys()),
            "total_active": len(self.active_sessions),
        }


# Global service instance
agent_service: Optional[EnhancedAgentService] = None


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit agent"""
    global agent_service
    
    print("🚀 Agent starting...")
    print(f"Job ID: {ctx.job.id}")
    
    # Initialize service if needed
    if agent_service is None:
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        if not all([SUPABASE_URL, SUPABASE_KEY]):
            raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")
        
        agent_service = EnhancedAgentService(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Agent service initialized")

    # Connect to room first
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    print(f"✅ Connected to room: {ctx.room.name}")
    
    # Parse user context from metadata
    user_context = {}
    
    # Method 1: Try job metadata first
    if ctx.job.metadata:
        try:
            job_data = json.loads(ctx.job.metadata)
            user_context.update(job_data)
            print(f"✅ Job metadata parsed: {job_data}")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse job metadata: {e}")
    
    # Method 2: Try room metadata
    if ctx.room.metadata:
        try:
            room_data = json.loads(ctx.room.metadata)
            user_context.update(room_data)  # This will override job data if both exist
            print(f"✅ Room metadata parsed: {room_data}")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse room metadata: {e}")
    
    # Validate we have required user data
    user_id = user_context.get("userId")
    if not user_id:
        print("❌ No userId found in metadata!")
        raise ValueError("userId is required in metadata")
    
    user_name = user_context.get("name", "there")
    user_email = user_context.get("email", "")
    
    print(f"✅ User context loaded:")
    print(f"   User ID: {user_id}")
    print(f"   Name: {user_name}")
    print(f"   Email: {user_email}")
    
    # Start the agent session
    try:
        await agent_service.start_agent_session(ctx, user_context)
        print("🎉 Agent session started successfully!")
        
        # Wait for participant
        participant = await ctx.wait_for_participant()
        print(f"👤 Participant joined: {participant.identity}")
        
        # Keep the session alive
        print("🔄 Agent session running...")
        
    except Exception as e:
        print(f"❌ Failed to start agent session: {e}")
        raise


if __name__ == "__main__":
    # Validate environment variables
    required_env_vars = ["SUPABASE_URL", "SUPABASE_KEY"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        raise ValueError(f"Please set the following environment variables: {', '.join(missing_vars)}")
    
    print("🔧 Starting LiveKit Agent...")
    print("✅ Environment variables validated")
    
    # Run the agent
    cli.run_app(
        WorkerOptions(entrypoint_fnc=entrypoint)
    )