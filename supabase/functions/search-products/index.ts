import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Real e-commerce stores with their search URL patterns
const stores = [
  { 
    name: 'Amazon', 
    searchUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    logo: '🛒'
  },
  { 
    name: 'Flipkart', 
    searchUrl: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    logo: '🛍️'
  },
  { 
    name: 'Myntra', 
    searchUrl: (q: string) => `https://www.myntra.com/${encodeURIComponent(q.toLowerCase().replace(/\s+/g, '-'))}`,
    logo: '👗'
  },
  { 
    name: 'ASOS', 
    searchUrl: (q: string) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
    logo: '✨'
  },
  { 
    name: 'H&M', 
    searchUrl: (q: string) => `https://www2.hm.com/en_us/search-results.html?q=${encodeURIComponent(q)}`,
    logo: '🏷️'
  },
  { 
    name: 'Zara', 
    searchUrl: (q: string) => `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(q)}`,
    logo: '🧥'
  },
  { 
    name: 'Nordstrom', 
    searchUrl: (q: string) => `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(q)}`,
    logo: '💎'
  },
  { 
    name: 'SHEIN', 
    searchUrl: (q: string) => `https://us.shein.com/pdsearch/${encodeURIComponent(q)}`,
    logo: '🌟'
  },
]

// Get appropriate image URL based on category
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { item } = await req.json()
    
    if (!item || !item.label) {
      throw new Error('No item provided')
    }

    console.log('Searching for products matching:', item)

    // Build search query from item details
    const searchTerms = [item.label]
    if (item.color) searchTerms.push(item.color)
    if (item.style) searchTerms.push(item.style)
    const searchQuery = searchTerms.join(' ')

    // Generate products with real e-commerce search links
    const products = stores.map((store, index) => ({
      id: Date.now() + index,
      name: `${item.label} on ${store.name}`,
      store: store.name,
      logo: store.logo,
      url: store.searchUrl(searchQuery),
      image: getImageUrl(item.category || ''),
      category: item.category,
      color: item.color,
      style: item.style,
    }))

    console.log('Generated product links for', stores.length, 'stores')

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in search-products function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
