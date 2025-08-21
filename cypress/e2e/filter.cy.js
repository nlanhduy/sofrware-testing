describe("Product Filter Tests", () => {
  beforeEach(() => {
    // Navigate to the page with the filters
    cy.visit("http://localhost:4200/#/");
    cy.wait(1000);
  });

  it("Tests all filter scenarios from JSON file", () => {
    // Track test results
    const results = {
      passed: [],
      failed: [],
    };

    // Load test data from JSON file
    cy.fixture("filter-tests.json")
      .then((filterTests) => {
        // Test each filter case
        cy.wrap(filterTests).each((testCase, index) => {
          cy.log(
            `Testing ${index + 1}/${filterTests.length}: ${testCase.testName}`
          );

          // Reload page to reset filters
          cy.reload();
          cy.wait(1000);

          // Apply category filters
          if (testCase.categoryId) {
            // Single category
            cy.get(`[data-test="category-${testCase.categoryId}"]`).check();
          } else if (testCase.categoryIds) {
            // Multiple categories
            testCase.categoryIds.forEach((id) => {
              cy.get(`[data-test="category-${id}"]`).check();
            });
          }

          // Apply brand filter if specified
          if (testCase.brandId) {
            cy.get(`[data-test="brand-${testCase.brandId}"]`).check();
          }

          // Wait for filters to apply automatically
          cy.wait(1500);

          // Count all products across all pages
          let totalProductCount = 0;

          function countProductsAcrossPages() {
            // Find product elements using various possible selectors
            cy.get("body").then(($body) => {
              // Try different selectors to find products
              const productElements = $body.find(
                '[data-test="product-name"], .product-name, .inventory_item_name, .product-title, .product h3'
              );

              if (productElements.length > 0) {
                // Products found on this page
                const currentPageCount = productElements.length;
                totalProductCount += currentPageCount;

                cy.log(
                  `Found ${currentPageCount} products on current page. Total so far: ${totalProductCount}`
                );

                // Check if pagination exists and Next button is enabled
                const nextButtonExists =
                  $body.find(".pagination-next a").length > 0;
                const nextButtonDisabled =
                  $body.find(".pagination-next.disabled").length > 0;

                if (nextButtonExists && !nextButtonDisabled) {
                  // Click Next button and continue counting on next page
                  cy.get(".pagination-next a").click();
                  cy.wait(1000); // Wait for page to load
                  countProductsAcrossPages(); // Recursive call
                } else {
                  // We've reached the last page, verify the total count
                  verifyProductCount(totalProductCount);
                }
              } else {
                // No products found on this page
                cy.log("No products found on this page");
                verifyProductCount(0);
              }
            });
          }

          function verifyProductCount(actualCount) {
            cy.log(`Total products found for filter: ${actualCount}`);

            // Check if actual count matches expected count
            let testPassed = actualCount === testCase.expectedCount;

            if (testPassed) {
              results.passed.push(testCase.testName);
              cy.log(`✅ PASS: Found ${actualCount} products as expected`);
            } else {
              const failureReason = `Expected ${testCase.expectedCount} products but found ${actualCount}`;
              results.failed.push({
                name: testCase.testName,
                reason: failureReason,
              });
              cy.log(`❌ FAIL: ${failureReason}`);
            }
          }

          // Start counting products across pages
          countProductsAcrossPages();
        });
      })
      .then(() => {
        // After all tests complete, log the summary
        cy.log("--- TEST SUMMARY ---");
        cy.log(`PASSED: ${results.passed.length} tests`);
        results.passed.forEach((test) => {
          cy.log(`✅ ${test}`);
        });
        cy.log(`FAILED: ${results.failed.length} tests`);
        results.failed.forEach((test) => {
          cy.log(`❌ ${test.name}: ${test.reason}`);
        });
      });
  });
});
