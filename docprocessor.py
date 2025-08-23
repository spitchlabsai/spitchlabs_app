# document_processor.py
import os
import uuid
from typing import List, Dict, Any
import asyncio
from pathlib import Path
import tempfile

import PyPDF2
import docx
from sentence_transformers import SentenceTransformer
import numpy as np
from supabase import create_client, Client
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
        return text

    async def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {str(e)}")
        return text

    async def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text based on file type"""
        if file_type.lower() == 'pdf':
            return await self.extract_text_from_pdf(file_path)
        elif file_type.lower() in ['docx', 'doc']:
            return await self.extract_text_from_docx(file_path)
        else:
            raise Exception(f"Unsupported file type: {file_type}")

    async def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks"""
        chunks = self.text_splitter.split_text(text)
        return chunks

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks"""
        embeddings = self.embedding_model.encode(texts)
        return embeddings.tolist()

    async def store_document_chunks(self, user_id: str, document_id: str, 
                                   chunks: List[str], embeddings: List[List[float]], 
                                   metadata: Dict[str, Any]) -> bool:
        """Store document chunks with embeddings in Supabase"""
        try:
            # First, store document metadata
            document_data = {
                'id': document_id,
                'user_id': user_id,
                'filename': metadata.get('filename', ''),
                'file_type': metadata.get('file_type', ''),
                'total_chunks': len(chunks),
                'created_at': 'now()',
                'updated_at': 'now()'
            }
            
            # Insert document record
            result = self.supabase.table('documents').insert(document_data).execute()
            
            # Store chunks with embeddings
            chunk_data = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_data.append({
                    'id': str(uuid.uuid4()),
                    'document_id': document_id,
                    'user_id': user_id,
                    'chunk_text': chunk,
                    'chunk_index': i,
                    'embedding': embedding,
                    'created_at': 'now()'
                })
            
            # Insert chunks in batches
            batch_size = 100
            for i in range(0, len(chunk_data), batch_size):
                batch = chunk_data[i:i + batch_size]
                self.supabase.table('document_chunks').insert(batch).execute()
                
            return True
            
        except Exception as e:
            print(f"Error storing document chunks: {str(e)}")
            return False

    async def process_document(self, file_path: str, user_id: str, filename: str, 
                              file_type: str) -> Dict[str, Any]:
        """Process a document end-to-end"""
        try:
            document_id = str(uuid.uuid4())
            
            # Extract text
            text = await self.extract_text(file_path, file_type)
            
            # Chunk text
            chunks = await self.chunk_text(text)
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(chunks)
            
            # Store in database
            metadata = {
                'filename': filename,
                'file_type': file_type,
                'document_id': document_id
            }
            
            success = await self.store_document_chunks(
                user_id, document_id, chunks, embeddings, metadata
            )
            
            if success:
                return {
                    'document_id': document_id,
                    'chunks_processed': len(chunks),
                    'status': 'success'
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Failed to store document chunks'
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }