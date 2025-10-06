import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Products from "@/models/products";
import jwt, { JwtPayload } from "jsonwebtoken";
import category from "@/models/category";
import { ElasticsearchService } from "@/lib/elasticsearch-service";
import { CacheService } from "@/lib/cache";
import { productQueue, emailQueue } from "@/lib/queue";

interface CustomJwtPayload extends JwtPayload {
  storeId?: string;
}

interface ProductFilterQuery {
  storeId: string;
  category?: string;
  status?: string;
}
export async function POST(request: Request) {
  const productData = await request.json();

  try {
    await connect();
    console.log("Connected to MongoDB");
    if(!connect){
        return NextResponse.json({ error: "Failed to connect to database" });
    }
    const token = request.headers.get("Authorization")?.split(' ')[1];
    
    if (!token){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decodedToken = jwt.decode(token) as CustomJwtPayload
    if (!decodedToken){
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const newProduct = new Products(productData);
    await newProduct.save();

    await ElasticsearchService.indexProduct(newProduct);
    
    // Queue background tasks
    await productQueue.add('index-product', {
      productId: newProduct._id,
      action: 'create'
    });
    
    await emailQueue.add('send-email', {
      to: 'admin@example.com',
      subject: 'New Product Created',
      body: `Product ${newProduct.name} has been created`
    });
    
    // Clear cache for this store
    await CacheService.clearProductCache("sample-store");
    
    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating product:", error);
    return NextResponse.json(
      { message: "Error creating product", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connect();
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = jwt.decode(token) as CustomJwtPayload;

    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // const storeId = decodedToken.storeId;
    const storeId = "sample-store";

    console.log(storeId, "storeId");

    if (!storeId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get pagination and filter parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryFilter = searchParams.get('category') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const skip = (page - 1) * limit;

    // Try to get from cache first
    const cacheKey = CacheService.getProductCacheKey("sample-store", page, limit, categoryFilter, statusFilter);
    const cached = await CacheService.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for products');
      return NextResponse.json(cached, { status: 200 });
    }
    
    console.log('Cache miss - fetching from database');

    // Build filter query
    const filterQuery: ProductFilterQuery = { storeId };
    if (categoryFilter) {
      filterQuery.category = categoryFilter;
    }
    if (statusFilter) {
      filterQuery.status = statusFilter;
    }

    // Get total count for pagination info
    const totalProducts = await Products.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Products.find(filterQuery)
      .populate({
        path: "category",
        model: category
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    const response = { 
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
    
    // Cache for 5 minutes
    await CacheService.set(cacheKey, response, 300);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}
