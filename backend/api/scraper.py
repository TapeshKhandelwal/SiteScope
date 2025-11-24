import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import os


class WebScraper:
    def __init__(self, url):
        self.url = url
        self.soup = None
        self.response = None
        
    def fetch_page(self):
        """Fetch the webpage content"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            self.response = requests.get(self.url, headers=headers, timeout=10)
            self.response.raise_for_status()
            self.soup = BeautifulSoup(self.response.content, 'lxml')
            return True
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching URL: {str(e)}")
    
    def get_meta_title(self):
        """Extract meta title"""
        # Try <title> tag first
        if self.soup.title and self.soup.title.string:
            return self.soup.title.string.strip()
        
        # Try og:title
        og_title = self.soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content'].strip()
        
        # Try twitter:title
        twitter_title = self.soup.find('meta', attrs={'name': 'twitter:title'})
        if twitter_title and twitter_title.get('content'):
            return twitter_title['content'].strip()
        
        return "No title found"
    
    def get_meta_description(self):
        """Extract meta description"""
        # Try standard meta description
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Try og:description
        og_desc = self.soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()
        
        # Try twitter:description
        twitter_desc = self.soup.find('meta', attrs={'name': 'twitter:description'})
        if twitter_desc and twitter_desc.get('content'):
            return twitter_desc['content'].strip()
        
        return "No description found"
    
    def get_meta_keywords(self):
        """Extract meta keywords"""
        meta_keywords = self.soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords and meta_keywords.get('content'):
            return meta_keywords['content'].strip()
        return "No keywords found"
    
    def get_og_image(self):
        """Extract Open Graph image"""
        og_image = self.soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content'].strip()
        return None
    
    def get_content(self):
        """Extract main content from the page"""
        # Remove script and style elements
        for script in self.soup(['script', 'style', 'noscript']):
            script.decompose()
        
        # Get text content
        text = self.soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Limit to first 1000 characters for display
        if len(text) > 1000:
            text = text[:1000] + "..."
        
        return text if text else "No content found"
    
    def get_headings(self):
        """Extract all headings (h1-h6)"""
        headings = {}
        for i in range(1, 7):
            tag = f'h{i}'
            found_headings = self.soup.find_all(tag)
            if found_headings:
                headings[tag] = [h.get_text(strip=True) for h in found_headings if h.get_text(strip=True)]
        return headings
    
    def get_internal_links(self):
        """Extract all internal links"""
        base_domain = urlparse(self.url).netloc
        internal_links = set()
        
        for link in self.soup.find_all('a', href=True):
            href = link['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(self.url, href)
            parsed_url = urlparse(absolute_url)
            
            # Check if it's an internal link
            if parsed_url.netloc == base_domain or parsed_url.netloc == '':
                # Remove fragments and query parameters for cleaner display
                clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
                if clean_url != self.url:  # Don't include the current page
                    internal_links.add(clean_url)
        
        return sorted(list(internal_links))[:50]  # Limit to 50 for performance
    
    def get_external_links(self):
        """Extract all external links"""
        base_domain = urlparse(self.url).netloc
        external_links = set()
        
        for link in self.soup.find_all('a', href=True):
            href = link['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(self.url, href)
            parsed_url = urlparse(absolute_url)
            
            # Check if it's an external link
            if parsed_url.netloc and parsed_url.netloc != base_domain:
                external_links.add(absolute_url)
        
        return sorted(list(external_links))[:50]  # Limit to 50 for performance
    
    def get_images(self):
        """Extract all images"""
        images = []
        for img in self.soup.find_all('img', src=True):
            img_url = urljoin(self.url, img['src'])
            alt_text = img.get('alt', 'No alt text')
            images.append({
                'src': img_url,
                'alt': alt_text
            })
        return images[:20]  # Limit to 20 images
    
    def get_language(self):
        """Extract page language"""
        html_tag = self.soup.find('html')
        if html_tag and html_tag.get('lang'):
            return html_tag['lang']
        return "Not specified"
    
    def get_canonical_url(self):
        """Extract canonical URL"""
        canonical = self.soup.find('link', rel='canonical')
        if canonical and canonical.get('href'):
            return canonical['href']
        return None
    
    def get_pagespeed_insights(self):
        """Get PageSpeed Insights data for both mobile and desktop"""
        try:
            # Get API key from environment variable
            api_key = os.environ.get('PAGE_INSIGHTS_API_KEY', '')
            
            if not api_key:
                return {
                    'error': 'PageSpeed Insights API key not configured',
                    'mobile': None,
                    'desktop': None
                }
            
            results = {
                'mobile': None,
                'desktop': None,
                'error': None
            }
            
            # Fetch desktop metrics
            try:
                psi_url_desktop = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={self.url}&key={api_key}&strategy=desktop&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO"
                desktop_response = requests.get(psi_url_desktop, timeout=30)
                
                if desktop_response.status_code == 200:
                    desktop_data = desktop_response.json()
                    results['desktop'] = self._parse_pagespeed_data(desktop_data)
            except Exception as e:
                results['desktop'] = {'error': str(e)}
            
            # Fetch mobile metrics
            try:
                psi_url_mobile = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={self.url}&key={api_key}&strategy=mobile&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO"
                mobile_response = requests.get(psi_url_mobile, timeout=30)
                
                if mobile_response.status_code == 200:
                    mobile_data = mobile_response.json()
                    results['mobile'] = self._parse_pagespeed_data(mobile_data)
            except Exception as e:
                results['mobile'] = {'error': str(e)}
            
            return results
            
        except Exception as e:
            return {
                'error': f'Failed to fetch PageSpeed Insights: {str(e)}',
                'mobile': None,
                'desktop': None
            }
    
    def _parse_pagespeed_data(self, data):
        """Parse PageSpeed Insights API response"""
        try:
            lighthouse = data.get('lighthouseResult', {})
            categories = lighthouse.get('categories', {})
            audits = lighthouse.get('audits', {})
            
            # Extract scores
            performance_score = categories.get('performance', {}).get('score', 0)
            accessibility_score = categories.get('accessibility', {}).get('score', 0)
            best_practices_score = categories.get('best-practices', {}).get('score', 0)
            seo_score = categories.get('seo', {}).get('score', 0)
            
            # Extract key metrics
            metrics = audits.get('metrics', {}).get('details', {}).get('items', [{}])[0]
            
            parsed_data = {
                'scores': {
                    'performance': round(performance_score * 100) if performance_score else 0,
                    'accessibility': round(accessibility_score * 100) if accessibility_score else 0,
                    'best_practices': round(best_practices_score * 100) if best_practices_score else 0,
                    'seo': round(seo_score * 100) if seo_score else 0,
                },
                'metrics': {
                    'first_contentful_paint': metrics.get('firstContentfulPaint'),
                    'speed_index': metrics.get('speedIndex'),
                    'largest_contentful_paint': metrics.get('largestContentfulPaint'),
                    'time_to_interactive': metrics.get('interactive'),
                    'total_blocking_time': metrics.get('totalBlockingTime'),
                    'cumulative_layout_shift': metrics.get('cumulativeLayoutShift'),
                },
                'opportunities': [],
                'diagnostics': []
            }
            
            # Extract opportunities (suggestions for improvement)
            for audit_id, audit_data in audits.items():
                if audit_data.get('score') is not None and audit_data.get('score') < 1:
                    if audit_data.get('details', {}).get('type') == 'opportunity':
                        parsed_data['opportunities'].append({
                            'title': audit_data.get('title'),
                            'description': audit_data.get('description'),
                            'score': round(audit_data.get('score', 0) * 100)
                        })
            
            # Limit opportunities to top 5
            parsed_data['opportunities'] = parsed_data['opportunities'][:5]
            
            return parsed_data
            
        except Exception as e:
            return {'error': f'Failed to parse PageSpeed data: {str(e)}'}
    
    def scrape(self):
        """Main scraping method that returns all data"""
        self.fetch_page()
        
        data = {
            'url': self.url,
            'status_code': self.response.status_code,
            'meta_title': self.get_meta_title(),
            'meta_description': self.get_meta_description(),
            'meta_keywords': self.get_meta_keywords(),
            'og_image': self.get_og_image(),
            'content': self.get_content(),
            'headings': self.get_headings(),
            'internal_links': self.get_internal_links(),
            'internal_links_count': len(self.get_internal_links()),
            'external_links': self.get_external_links(),
            'external_links_count': len(self.get_external_links()),
            'images': self.get_images(),
            'images_count': len(self.get_images()),
            'language': self.get_language(),
            'canonical_url': self.get_canonical_url(),
            'content_length': len(self.response.content),
            'pagespeed_insights': self.get_pagespeed_insights(),
        }
        
        return data

