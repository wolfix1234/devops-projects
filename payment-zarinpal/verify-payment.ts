import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Order from "@/models/orders";
import "@/lib/types";

export async function POST(request: NextRequest) {
  console.log("=== Payment Verify API Called ===");
  
  try {
    console.log("1. Parsing request body...");
    const { authority } = await request.json();
    console.log("Authority received:", authority);

    if (!authority) {
      console.log("ERROR: No authority provided");
      return NextResponse.json({
        success: false,
        message: "Authority is required"
      }, { status: 400 });
    }

    console.log("2. Checking global.pendingOrders...");
    console.log("global.pendingOrders exists:", !!global.pendingOrders);
    console.log("pendingOrders size:", global.pendingOrders?.size || 0);
    
    // Retrieve stored order data
    const pendingOrder = global.pendingOrders?.get(authority);
    console.log("3. Pending order found:", !!pendingOrder);
    
    if (!pendingOrder) {
      console.log("ERROR: Order not found for authority:", authority);
      return NextResponse.json({
        success: false,
        message: "Order not found or expired"
      }, { status: 400 });
    }

    console.log("4. Checking order expiration...");
    console.log("Current time:", new Date());
    console.log("Order expires at:", pendingOrder.expiresAt);
    
    // Check if order has expired
    if (new Date() > pendingOrder.expiresAt) {
      console.log("ERROR: Order has expired");
      global.pendingOrders?.delete(authority);
      return NextResponse.json({
        success: false,
        message: "Order has expired"
      }, { status: 400 });
    }

    console.log("5. Preparing Zarinpal verification...");
    console.log("Merchant ID:", process.env.ZARINPAL_MERCHANT_ID ? "[SET]" : "[NOT SET]");
    console.log("Payment amount:", pendingOrder.paymentAmount);
    
    const verifyData = {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: pendingOrder.paymentAmount,
      authority
    };
    console.log("Verify data:", verifyData);

    console.log("6. Calling Zarinpal API...");
    const response = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(verifyData)
    });
    
    console.log("Zarinpal response status:", response.status);
    const result = await response.json();
    console.log("Zarinpal response:", result);

    if (result.data?.code === 100 || result.data?.code === 101) {
      console.log("7. Payment verified, creating order in database...");
      
      try {
        await connect();
        console.log("Database connected successfully");
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        throw dbError;
      }
      
      console.log("8. Preparing order data...");
      console.log("Pending order structure:", Object.keys(pendingOrder));
      console.log("Shipping address from pending order:", pendingOrder.shippingAddress);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { authority: _authority, paymentAmount: _paymentAmount, expiresAt: _expiresAt, ...orderFields } = pendingOrder;
      const orderData = {
        ...orderFields,
        status: "processing", // Use valid enum value
        paymentStatus: "completed",
        paymentAuthority: authority,
        paymentRefId: result.data.ref_id,
        cardPan: result.data.card_pan,
        verifiedAt: new Date(),
        storeId: process.env.STOREID
      };
      console.log("Order data to save:", JSON.stringify(orderData, null, 2));
      console.log("Final shipping address:", orderData.shippingAddress);
      
      console.log("9. Creating order in database...");
      try {
        const order = await Order.create(orderData);
        console.log("Order created successfully:", order._id);
        
        // Clean up pending order
        global.pendingOrders?.delete(authority);
        console.log("10. Pending order cleaned up");
        
        const response = {
          success: true,
          verified: result.data.code === 100,
          already_verified: result.data.code === 101,
          ref_id: result.data.ref_id,
          card_pan: result.data.card_pan,
          order: {
            id: order._id,
            totalAmount: order.totalAmount,
            products: order.products
          }
        };
        console.log("11. Sending success response:", response);
        return NextResponse.json(response);
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }
    } else {
      console.log("Payment verification failed. Zarinpal code:", result.data?.code);
      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
        zarinpalCode: result.data?.code
      }, { status: 400 });
    }
  } catch (error) {
    console.error("=== PAYMENT VERIFICATION ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", (error as Error)?.message);
    console.error("Error stack:", (error as Error)?.stack);
    console.error("Full error object:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: (error as Error)?.message || "Unknown error"
    }, { status: 500 });
  }
}