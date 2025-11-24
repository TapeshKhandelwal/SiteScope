import google.generativeai as genai
from decouple import Config, RepositoryEnv
import json
import os


class GeminiAIService:
    def __init__(self):
        # Load .env from api folder
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        try:
            config = Config(RepositoryEnv(env_path))
            self.api_key = config('GEMINI_API_KEY', default='').strip().strip("'\"")
            self.project_id = config('GEMINI_PROJECT', default='').strip().strip("'\"")
        except Exception as e:
            print(f"Error loading .env: {e}")
            self.api_key = ''
            self.project_id = ''
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Use Gemini Flash - fast and cost-effective
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Error configuring Gemini: {e}")
                self.model = None
        else:
            self.model = None
    
    def is_configured(self):
        """Check if Gemini API is properly configured"""
        return self.model is not None
    
    def generate_meta_title(self, current_title, meta_description, content_preview, keywords):
        """Generate optimized meta title suggestions"""
        prompt = f"""You are an expert SEO specialist. Analyze the following website data and generate 5 highly optimized meta title suggestions.

Current Meta Title: {current_title}
Meta Description: {meta_description}
Content Preview: {content_preview[:500]}
Keywords: {keywords}

Requirements for meta titles:
1. Length: 50-60 characters (optimal for Google search results)
2. Include primary keyword naturally
3. Be compelling and click-worthy
4. Accurately describe the page content
5. Use power words and emotional triggers
6. Avoid keyword stuffing
7. Make each suggestion unique and different in approach

Generate 5 creative and effective meta title options. Return ONLY a valid JSON array with this exact structure:
[
  {{"title": "suggestion 1", "length": 55, "reason": "why this works"}},
  {{"title": "suggestion 2", "length": 58, "reason": "why this works"}},
  {{"title": "suggestion 3", "length": 52, "reason": "why this works"}},
  {{"title": "suggestion 4", "length": 57, "reason": "why this works"}},
  {{"title": "suggestion 5", "length": 54, "reason": "why this works"}}
]

Return ONLY the JSON array, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            # Extract JSON from response
            text = response.text.strip()
            # Remove markdown code blocks if present
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            suggestions = json.loads(text)
            return suggestions
        except Exception as e:
            return {'error': str(e)}
    
    def generate_meta_description(self, current_description, meta_title, content_preview, keywords):
        """Generate optimized meta description suggestions"""
        prompt = f"""You are an expert SEO specialist. Analyze the following website data and generate 5 highly optimized meta description suggestions.

Current Meta Description: {current_description}
Meta Title: {meta_title}
Content Preview: {content_preview[:500]}
Keywords: {keywords}

Requirements for meta descriptions:
1. Length: 150-160 characters (optimal for Google search results)
2. Include primary and secondary keywords naturally
3. Include a clear call-to-action
4. Provide compelling value proposition
5. Accurately summarize page content
6. Use active voice and persuasive language
7. Make each suggestion unique with different angles

Generate 5 creative and effective meta description options. Return ONLY a valid JSON array with this exact structure:
[
  {{"description": "suggestion 1", "length": 155, "reason": "why this works"}},
  {{"description": "suggestion 2", "length": 158, "reason": "why this works"}},
  {{"description": "suggestion 3", "length": 152, "reason": "why this works"}},
  {{"description": "suggestion 4", "length": 157, "reason": "why this works"}},
  {{"description": "suggestion 5", "length": 154, "reason": "why this works"}}
]

Return ONLY the JSON array, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            suggestions = json.loads(text)
            return suggestions
        except Exception as e:
            return {'error': str(e)}
    
    def generate_keywords(self, meta_title, meta_description, content_preview, headings):
        """Generate SEO keyword suggestions"""
        prompt = f"""You are an expert SEO keyword researcher. Analyze the following website data and generate strategic keyword suggestions.

Meta Title: {meta_title}
Meta Description: {meta_description}
Content Preview: {content_preview[:500]}
Main Headings: {', '.join(headings[:10]) if headings else 'None'}

Analyze the content and generate:
1. Primary Keywords (3-5): Most important, high-value keywords
2. Secondary Keywords (5-8): Supporting keywords with good search potential
3. Long-tail Keywords (5-10): Specific phrases with lower competition
4. LSI Keywords (5-8): Semantically related keywords for context

Return ONLY a valid JSON object with this exact structure:
{{
  "primary": ["keyword1", "keyword2", "keyword3"],
  "secondary": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "long_tail": ["long phrase 1", "long phrase 2", "long phrase 3"],
  "lsi": ["related1", "related2", "related3"]
}}

Return ONLY the JSON object, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            keywords = json.loads(text)
            return keywords
        except Exception as e:
            return {'error': str(e)}
    
    def generate_content_improvements(self, content_preview, meta_title, headings, target_keywords):
        """Generate content improvement suggestions"""
        prompt = f"""You are an expert SEO content strategist. Analyze the following website content and provide actionable improvement recommendations.

Meta Title: {meta_title}
Main Headings: {', '.join(headings[:5]) if headings else 'None'}
Content Preview: {content_preview[:800]}
Target Keywords: {target_keywords}

Analyze and provide specific recommendations for:
1. Content Structure: How to improve heading hierarchy and content flow
2. Keyword Optimization: Where and how to naturally incorporate keywords
3. Readability: Suggestions to improve clarity and engagement
4. SEO Best Practices: Technical and on-page SEO improvements
5. Call-to-Action: Suggestions for better user engagement

Return ONLY a valid JSON object with this exact structure:
{{
  "structure": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keywords": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "readability": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "seo": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "cta": ["suggestion 1", "suggestion 2", "suggestion 3"]
}}

Return ONLY the JSON object, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            improvements = json.loads(text)
            return improvements
        except Exception as e:
            return {'error': str(e)}
    
    def generate_heading_suggestions(self, current_headings, meta_title, content_preview):
        """Generate improved heading structure suggestions"""
        prompt = f"""You are an expert SEO content optimizer. Analyze the current heading structure and suggest improvements.

Meta Title: {meta_title}
Current Headings: {json.dumps(current_headings) if current_headings else 'None'}
Content Preview: {content_preview[:500]}

Analyze the heading structure and provide:
1. Improved H1 suggestions (2-3 options)
2. Strategic H2 suggestions (3-5 options) for main sections
3. Supporting H3 suggestions (3-5 options) for subsections
4. Overall structure recommendations

Requirements:
- H1 should be unique, keyword-rich, and compelling
- H2s should organize main topics logically
- H3s should support H2s with specific subtopics
- All headings should be scannable and descriptive

Return ONLY a valid JSON object with this exact structure:
{{
  "h1": ["suggestion 1", "suggestion 2"],
  "h2": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "h3": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}

Return ONLY the JSON object, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            suggestions = json.loads(text)
            return suggestions
        except Exception as e:
            return {'error': str(e)}
    
    def chat_about_website(self, question, scraped_data, chat_history=None):
        """
        Answer questions about the website using AI
        
        Args:
            question: User's question
            scraped_data: All scraped website data
            chat_history: Previous conversation for context
        """
        # First, optimize the user's question
        optimized_question = self._optimize_question(question, scraped_data)
        
        # Build context from scraped data
        context = self._build_website_context(scraped_data)
        
        # Build conversation history
        history_text = ""
        if chat_history:
            history_text = "\n\nPrevious conversation:\n"
            for msg in chat_history[-5:]:  # Last 5 messages for context
                history_text += f"{msg['role']}: {msg['content']}\n"
        
        prompt = f"""You are an expert SEO and web analytics consultant. A user has analyzed a website and wants to ask questions about it.

Website Data:
{context}
{history_text}

User's Question: {question}
Optimized Question: {optimized_question}

IMPORTANT INSTRUCTIONS:
1. Keep your answer CONCISE and to-the-point (3-5 sentences max) unless the user explicitly asks for detailed analysis
2. Use data from the website analysis to support your answer
3. Format your response using markdown for better readability:
   - Use **bold** for emphasis
   - Use `code` for technical terms
   - Use numbered lists for steps (1. 2. 3.)
   - Use bullet points for lists (-)
4. Be specific and actionable
5. If the question asks for "detailed", "comprehensive", or "in-depth" analysis, then provide more detail

Your concise, markdown-formatted answer:"""

        try:
            response = self.model.generate_content(prompt)
            return {
                'answer': response.text,
                'optimized_question': optimized_question,
                'original_question': question
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _optimize_question(self, question, scraped_data):
        """Optimize/clarify the user's question"""
        prompt = f"""Given this user question about a website: "{question}"

And knowing the website has:
- Title: {scraped_data.get('meta_title', 'N/A')}
- Description: {scraped_data.get('meta_description', 'N/A')}
- {scraped_data.get('internal_links_count', 0)} internal links
- {scraped_data.get('external_links_count', 0)} external links

Rephrase this question to be more specific and actionable for SEO/website analysis. Make it clear and focused. Return ONLY the optimized question, nothing else."""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return question
    
    def _build_website_context(self, scraped_data):
        """Build context string from scraped data"""
        headings_text = ""
        if scraped_data.get('headings'):
            for tag, items in scraped_data['headings'].items():
                headings_text += f"\n{tag.upper()}: {', '.join(items[:3])}"
        
        context = f"""
URL: {scraped_data.get('url', 'N/A')}
Meta Title: {scraped_data.get('meta_title', 'N/A')}
Meta Description: {scraped_data.get('meta_description', 'N/A')}
Meta Keywords: {scraped_data.get('meta_keywords', 'N/A')}
Content Length: {scraped_data.get('content_length', 0)} bytes
Language: {scraped_data.get('language', 'N/A')}
Internal Links: {scraped_data.get('internal_links_count', 0)}
External Links: {scraped_data.get('external_links_count', 0)}
Images: {scraped_data.get('images_count', 0)}
Headings: {headings_text}
Content Preview: {scraped_data.get('content', '')[:800]}
"""
        return context
    
    def generate_comprehensive_analysis(self, scraped_data):
        """Generate comprehensive SEO analysis and recommendations"""
        prompt = f"""You are an expert SEO auditor. Perform a comprehensive analysis of this website data.

Meta Title: {scraped_data.get('meta_title', 'N/A')}
Meta Description: {scraped_data.get('meta_description', 'N/A')}
Meta Keywords: {scraped_data.get('meta_keywords', 'N/A')}
Content Length: {scraped_data.get('content_length', 0)} bytes
Internal Links: {scraped_data.get('internal_links_count', 0)}
External Links: {scraped_data.get('external_links_count', 0)}
Images: {scraped_data.get('images_count', 0)}
Language: {scraped_data.get('language', 'N/A')}

Provide a comprehensive SEO audit with:
1. Overall SEO Score (0-100)
2. Critical Issues (3-5 most important problems)
3. Quick Wins (3-5 easy improvements with high impact)
4. Long-term Strategy (3-5 strategic recommendations)
5. Technical SEO Issues (3-5 technical problems)
6. Content Quality Assessment

Return ONLY a valid JSON object with this exact structure:
{{
  "score": 75,
  "critical_issues": ["issue 1", "issue 2", "issue 3"],
  "quick_wins": ["win 1", "win 2", "win 3"],
  "strategy": ["strategy 1", "strategy 2", "strategy 3"],
  "technical": ["tech issue 1", "tech issue 2", "tech issue 3"],
  "content_quality": "Assessment paragraph describing content quality"
}}

Return ONLY the JSON object, no additional text or explanation."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            analysis = json.loads(text)
            return analysis
        except Exception as e:
            return {'error': str(e)}

