import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Shopping aggregators and stores with their search patterns
const shoppingLinks = [
  { 
    name: 'Google Shopping', 
    searchUrl: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`,
    description: 'Compare prices across all stores',
    icon: '🔍',
    isPrimary: true
  },
  { 
    name: 'Amazon', 
    searchUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    description: 'Shop on Amazon',
    icon: '📦'
  },
  { 
    name: 'Flipkart', 
    searchUrl: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    description: 'Shop on Flipkart',
    icon: '🛒'
  },
  { 
    name: 'Myntra', 
    searchUrl: (q: string) => `https://www.myntra.com/${encodeURIComponent(q.toLowerCase().replace(/\s+/g, '-'))}`,
    description: 'Fashion on Myntra',
    icon: '👗'
  },
  { 
    name: 'ASOS', 
    searchUrl: (q: string) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
    description: 'Shop on ASOS',
    icon: '✨'
  },
  { 
    name: 'H&M', 
    searchUrl: (q: string) => `https://www2.hm.com/en_us/search-results.html?q=${encodeURIComponent(q)}`,
    description: 'Shop on H&M',
    icon: '🏷️'
  },
  { 
    name: 'Zara', 
    searchUrl: (q: string) => `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(q)}`,
    description: 'Shop on Zara',
    icon: '🧥'
  },
  { 
    name: 'Nordstrom', 
    searchUrl: (q: string) => `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(q)}`,
    description: 'Shop on Nordstrom',
    icon: '💎'
  },
  { 
    name: 'eBay', 
    searchUrl: (q: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    description: 'Find deals on eBay',
    icon: '🏪'
  },
  { 
    name: 'Ajio', 
    searchUrl: (q: string) => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
    description: 'Shop on Ajio',
    icon: '🎯'
  },
]

// Get appropriate placeholder image based on category
function getImageUrl(category: string): string {
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('top') || categoryLower.includes('shirt') || categoryLower.includes('blouse')) {
    return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop'
  }
  if (categoryLower.includes('bottom') || categoryLower.includes('pant') || categoryLower.includes('jean') || categoryLower.includes('trouser')) {
    return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=400&fit=crop'
  }
  if (categoryLower.includes('dress')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop'
  }
  if (categoryLower.includes('jacket') || categoryLower.includes('coat') || categoryLower.includes('outerwear')) {
    return 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop'
  }
  if (categoryLower.includes('shoe') || categoryLower.includes('footwear') || categoryLower.includes('sneaker') || categoryLower.includes('boot')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop'
  }
  return 'https://images.unsplash.com/photo-1611923134239-b9be5816e23e?w=300&h=400&fit=crop'
}

// Sanitize input to prevent injection
function sanitizeInput(input: string | null | undefined, maxLength = 100): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>{}[\]]/g, '')
    .slice(0, maxLength)
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { item } = await req.json()
    
    if (!item || !item.label) {
      return new Response(JSON.stringify({ error: 'No item provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Sanitize all inputs
    const sanitizedLabel = sanitizeInput(item.label, 100);
    const sanitizedColor = sanitizeInput(item.color, 30);
    const sanitizedStyle = sanitizeInput(item.style, 30);
    const sanitizedCategory = sanitizeInput(item.category, 30);

    if (!sanitizedLabel) {
      return new Response(JSON.stringify({ error: 'Invalid item label' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Searching for products matching:', sanitizedLabel)

    // Build optimized search query
    const searchTerms = [sanitizedLabel]
    if (sanitizedColor) searchTerms.push(sanitizedColor)
    if (sanitizedStyle) searchTerms.push(sanitizedStyle)
    // Add "buy" keyword to get shopping results
    const searchQuery = `buy ${searchTerms.join(' ')}`

    // Generate shopping links with Google Shopping as primary for price comparison
    const products = shoppingLinks.map((store, index) => ({
      id: Date.now() + index,
      name: store.isPrimary ? `Compare ${sanitizedLabel} prices` : `${sanitizedLabel}`,
      store: store.name,
      description: store.description,
      icon: store.icon,
      url: store.searchUrl(searchQuery),
      image: getImageUrl(sanitizedCategory || ''),
      category: sanitizedCategory,
      color: sanitizedColor,
      style: sanitizedStyle,
      isPrimary: store.isPrimary || false,
    }))

    console.log('Generated shopping links for', shoppingLinks.length, 'stores')

    return new Response(JSON.stringify({ 
      products,
      searchQuery,
      message: 'Click "Compare prices" to see deals from all stores, or shop directly on individual sites'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in search-products function:', error)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
