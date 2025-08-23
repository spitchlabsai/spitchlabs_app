# from dotenv import load_dotenv

# from livekit import agents
# from livekit.agents import AgentSession, Agent, RoomInputOptions
# from livekit.plugins import (
#     spitch,
#     assemblyai,
#     google,
#     noise_cancellation,
#     silero,
# )

# load_dotenv()

# class SalesAgent(Agent):
#     def __init__(self) -> None:
#         super().__init__(
#             instructions="""
# You are a professional sales agent for SwiftStep Shoes, your name is Lina, a footwear company.

# - Opening: Start the call with energy and warmth.
# - Mention the knowledge base briefly: 
#   I can see we have 5 product guides 
#    with 27 details I can reference.
# - Key Products: running sh
# - Current Offers:
# - Goal: Engage the customer, highlight at least one product & one offer, 
#   and try to close with a follow-up or sale.

# Always sound natural and conversational, not like you're reading a script.
# """
#         )


# async def entrypoint(ctx: agents.JobContext):
#     session = AgentSession(
#         turn_detection="stt",
#         stt=assemblyai.STT(
#             end_of_turn_confidence_threshold=0.7,
#             min_end_of_turn_silence_when_confident=160,
#             max_turn_silence=2400,
#         ),
#         vad=silero.VAD.load(),
#         llm=google.LLM(
#             model="gemini-2.0-flash-exp",
#         ),
#         tts=spitch.TTS(
#             language="en",
#             voice="lina",
#         ),
#     )

#     await session.start(
#         room=ctx.room,
#         agent=SalesAgent(),
#         room_input_options=RoomInputOptions(
#             noise_cancellation=noise_cancellation.BVC(),
#         ),
#     )

#     await session.generate_reply(
#         instructions="greet them warmly, and start introducing the shoe company."
#     )


# if __name__ == "__main__":
#     agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))


import asyncio
import websockets
import json

async def client():
    async with websockets.connect("wss://0.0.0.0:8765") as ws:
        # Start session
        await ws.send(json.dumps({
            "command": "start_session",
            "user_id": "user123",
            "room_name": "room1",
            "job_context": {
                "job": {"id": "job1", "metadata": json.dumps({"userId": "user123", "email": "user@example.com"})},
                "room": {"name": "room1"}
            }
        }))
        # Receive response
        response = await ws.recv()
        print("Response:", response)

        # Send message
        await ws.send(json.dumps({
            "command": "send_message",
            "user_id": "user123",
            "room_name": "room1",
            "message": "Tell me about your best shoes!"
        }))
        response = await ws.recv()
        print("Response:", response)

asyncio.run(client())