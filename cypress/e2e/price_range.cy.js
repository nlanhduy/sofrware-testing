describe("Price Range Filter Tests", () => {
  beforeEach(() => {
    // Navigate to the page with the slider
    cy.visit("http://localhost:4200/#/");
    cy.wait(1000); // Wait for page to load completely
  });

  /**
   * Extracts numeric price from price text (e.g., "$14.15" -> 14.15)
   * @param {string} priceText - The price text to parse
   * @returns {number} The numeric price value
   */
  function extractPrice(priceText) {
    return parseFloat(priceText.replace(/[^\d.-]/g, ""));
  }

  /**
   * Tests the price range filter with specific min and max values
   * Uses soft assertions to continue testing even if assertions fail
   * @param {number} minPrice - Minimum price to set
   * @param {number} maxPrice - Maximum price to set
   */
  function testPriceRange(minPrice, maxPrice) {
    cy.log(`Testing price range: ${minPrice} - ${maxPrice}`);

    // Interact with Angular component to set price range
    cy.window().then((win) => {
      // Execute JavaScript to find and modify the slider component
      win.eval(`
        // Find the ngx-slider component
        const sliderElement = document.querySelector('ngx-slider');
        
        // Function to trigger change events
        function triggerEvent(element, eventName) {
          const event = new Event(eventName, { bubbles: true });
          element.dispatchEvent(event);
        }
        
        // Try to find and update the Angular component directly
        if (window.ng && window.ng.getComponent) {
          // If Angular's API is available
          const component = window.ng.getComponent(sliderElement);
          if (component) {
            // Update values directly
            component.value = ${minPrice};
            component.highValue = ${maxPrice};
            
            // Trigger change detection
            if (component.valueChange && component.valueChange.emit) {
              component.valueChange.emit(${minPrice});
              component.highValueChange.emit(${maxPrice});
            }
          }
        } else {
          // Alternative approach: Use Angular debugging tools if available
          if (window.getAllAngularRootElements) {
            const rootElements = window.getAllAngularRootElements();
            for (const rootElement of rootElements) {
              const debugElement = window.ng.probe(rootElement);
              if (debugElement) {
                // Find component
                const componentInstance = debugElement.componentInstance;
                // Look for component containing slider
                if (componentInstance.sliders || 
                    componentInstance.priceRange || 
                    componentInstance.priceFilter) {
                  // Update values
                  if (componentInstance.priceRange) {
                    componentInstance.priceRange.min = ${minPrice};
                    componentInstance.priceRange.max = ${maxPrice};
                  }
                  // Trigger change detection
                  if (componentInstance.changeDetectorRef) {
                    componentInstance.changeDetectorRef.detectChanges();
                  }
                }
              }
            }
          }
        }
        
        // Final approach: Simulate user events if the above methods don't work
        const minPointer = sliderElement.querySelector('.ngx-slider-pointer-min');
        const maxPointer = sliderElement.querySelector('.ngx-slider-pointer-max');
        
        if (minPointer && maxPointer) {
          // Get slider dimensions
          const sliderRect = sliderElement.getBoundingClientRect();
          const sliderWidth = sliderRect.width;
          
          // Calculate positions
          const totalRange = 200;
          const minPosition = (${minPrice} / totalRange) * sliderWidth;
          const maxPosition = (${maxPrice} / totalRange) * sliderWidth;
          
          // Create mouse event helper
          const createMouseEvent = (type, x, y) => {
            const event = new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: x,
              clientY: y
            });
            return event;
          };
          
          // Simulate dragging min pointer
          const minStartX = sliderRect.left + 10;
          const minTargetX = sliderRect.left + minPosition;
          
          minPointer.dispatchEvent(createMouseEvent('mousedown', minStartX, 0));
          minPointer.dispatchEvent(createMouseEvent('mousemove', minTargetX, 0));
          document.dispatchEvent(createMouseEvent('mouseup', minTargetX, 0));
          
          // Simulate dragging max pointer
          const maxStartX = sliderRect.left + sliderWidth - 10;
          const maxTargetX = sliderRect.left + maxPosition;
          
          maxPointer.dispatchEvent(createMouseEvent('mousedown', maxStartX, 0));
          maxPointer.dispatchEvent(createMouseEvent('mousemove', maxTargetX, 0));
          document.dispatchEvent(createMouseEvent('mouseup', maxTargetX, 0));
        }
      `);
    });

    // Wait for the filter to take effect
    cy.wait(2000);

    // Initialize variables to track all products across pages
    let allProductsInRange = true;
    let outOfRangeProducts = [];
    let totalProductCount = 0;

    // Function to check products on current page and navigate to next page
    function checkProductsOnCurrentPage() {
      // Get all product prices on the current page
      cy.get('[data-test="product-price"]').then(($prices) => {
        // Count products on this page
        const productsOnPage = $prices.length;
        totalProductCount += productsOnPage;

        cy.log(
          `Found ${productsOnPage} products on current page. Total so far: ${totalProductCount}`
        );

        // Check each product price
        for (let i = 0; i < $prices.length; i++) {
          const price = extractPrice($prices[i].innerHTML);

          // Check if price is within range
          if (price < minPrice - 0.01 || price > maxPrice + 0.01) {
            allProductsInRange = false;
            outOfRangeProducts.push({
              price: price,
              page: Math.ceil(totalProductCount / productsOnPage),
            });
          }
        }

        // Check if there's a next page
        cy.get("body").then(($body) => {
          const nextButtonExists = $body.find(".pagination-next a").length > 0;
          const nextButtonDisabled =
            $body.find(".pagination-next.disabled").length > 0;

          if (nextButtonExists && !nextButtonDisabled) {
            // Go to next page and continue checking
            cy.get(".pagination-next a").click();
            cy.wait(1000);
            checkProductsOnCurrentPage();
          } else {
            // We've checked all pages, report results
            if (totalProductCount === 0) {
              cy.log(
                `ℹ️ No products displayed in price range ${minPrice} - ${maxPrice}`
              );
            } else {
              if (allProductsInRange) {
                cy.log(
                  `✅ PASSED: All ${totalProductCount} products are within price range ${minPrice} - ${maxPrice}`
                );
              } else {
                cy.log(
                  `❌ FAILED: Found ${outOfRangeProducts.length} out of ${totalProductCount} products outside price range ${minPrice} - ${maxPrice}`
                );

                // Log details of out-of-range products
                outOfRangeProducts.forEach((item, index) => {
                  cy.log(
                    `  Product ${index + 1}: Price $${item.price} on page ${
                      item.page
                    }`
                  );
                });

                // Store the failure information
                const failures = Cypress.env("testFailures") || [];
                failures.push(
                  `Price range ${minPrice} - ${maxPrice} failed: ${outOfRangeProducts.length} products out of range`
                );
                Cypress.env("testFailures", failures);
              }
            }
          }
        });
      });
    }

    // Start checking products across all pages
    checkProductsOnCurrentPage();
  }

  it("Tests all price ranges from JSON file with soft assertions", () => {
    // Reset the failures list
    Cypress.env("testFailures", []);

    // Load test data from JSON file
    cy.fixture("price-ranges.json").then((priceRanges) => {
      // Test each price range
      priceRanges.forEach((range, index) => {
        // Log the current test
        cy.log(
          `🔍 Testing price range ${index + 1}/${priceRanges.length}: ${
            range.minPrice
          } - ${range.maxPrice}`
        );

        // Reload page to ensure clean state for each test
        cy.reload();
        cy.wait(1000);

        // Test the price range
        testPriceRange(range.minPrice, range.maxPrice);
      });

      // After all tests, report any failures
      cy.then(() => {
        const failures = Cypress.env("testFailures") || [];
        const totalTests = priceRanges.length; // Total number of test cases
        const successfulTests = totalTests - failures.length; // Calculate successful tests

        if (failures.length > 0) {
          cy.log(`❌ ${failures.length} tests failed:`);
          failures.forEach((failure, i) => {
            cy.log(`  ${i + 1}. ${failure}`);
          });
        } else {
          cy.log("✅ All price range tests passed!");
        }
        cy.log(
          `✅ Total successful tests: ${successfulTests} out of ${totalTests}`
        );
      });
    });
  });
});
