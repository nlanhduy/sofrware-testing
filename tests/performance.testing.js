import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
export let errorRate = new Rate("errors");

// Test configuration
export let options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "5m", target: 10 },
    { duration: "2m", target: 20 },
    { duration: "5m", target: 20 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.1"],
    errors: ["rate<0.1"],
  },
};

// Base URL
const BASE_URL = "https://www.fahasa.com";

// Common headers
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

export default function () {
  const searchQuery = "manga";
  const productId = 569948;
  const productUrl = "magic-and-muscles-6.html";

  // Step 1: Search for a product
  console.log("Step 1: Searching for products...");
  let searchResponse = http.get(`${BASE_URL}/searchengine?q=${searchQuery}`, {
    headers: headers,
    tags: { name: "search_products" },
  });

  let searchSuccess = check(searchResponse, {
    "Search request successful": (r) => r.status === 200,
    "Search response time < 3s": (r) => r.timings.duration < 3000,
    "Search contains results": (r) =>
      r.body.includes("product") || r.body.includes("item"),
  });

  errorRate.add(!searchSuccess);

  sleep(1);

  // Step 2: Open product detail page
  console.log("Step 2: Opening product detail page...");
  let productDetailResponse = http.get(`${BASE_URL}/${productUrl}`, {
    headers: headers,
    tags: { name: "product_detail" },
  });

  let productDetailSuccess = check(productDetailResponse, {
    "Product detail request successful": (r) => r.status === 200,
    "Product detail response time < 3s": (r) => r.timings.duration < 3000,
    "Product detail page loaded": (r) =>
      r.body.includes("product") || r.body.includes("price"),
  });

  errorRate.add(!productDetailSuccess);

  sleep(2);

  // Step 3: Add product to cart
  console.log("Step 3: Adding product to cart...");
  let addToCartPayload = JSON.stringify({
    product_id: productId,
    qty: "1",
    fhs_campaign: "SEARCH",
  });

  let addToCartHeaders = {
    ...headers,
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  let addToCartResponse = http.post(
    `${BASE_URL}/checkout_api/cart/add`,
    addToCartPayload,
    {
      headers: addToCartHeaders,
      tags: { name: "add_to_cart" },
    }
  );

  let addToCartSuccess = check(addToCartResponse, {
    "Add to cart request successful": (r) =>
      r.status === 200 || r.status === 201,
    "Add to cart response time < 2s": (r) => r.timings.duration < 2000,
    "Product added successfully": (r) =>
      r.body.includes("success") ||
      r.body.includes("added") ||
      r.status === 200,
  });

  errorRate.add(!addToCartSuccess);

  sleep(1);

  // Step 4: View cart
  console.log("Step 4: Viewing cart page...");
  let cartResponse = http.get(`${BASE_URL}/checkout/cart/`, {
    headers: headers,
    tags: { name: "view_cart" },
  });

  let cartSuccess = check(cartResponse, {
    "Cart page request successful": (r) => r.status === 200,
    "Cart page response time < 3s": (r) => r.timings.duration < 3000,
    "Cart page loaded": (r) =>
      r.body.includes("cart") || r.body.includes("checkout"),
  });

  errorRate.add(!cartSuccess);

  sleep(Math.random() * 2 + 1);
}

// Setup
export function setup() {
  console.log("Starting Fahasa performance test...");
  console.log("Test configuration:", JSON.stringify(options, null, 2));
  return {};
}

// Teardown
export function teardown(data) {
  console.log("Fahasa performance test completed.");
}
