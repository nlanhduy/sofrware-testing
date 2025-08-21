describe("Sort Functionality by Value or Label", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/#/");
    cy.wait(1000);
  });

  // ----------- Select by VALUE -------------

  it("Sorts by Name (A - Z) using value name,asc", () => {
    // Apply the sort - Name (A - Z)
    cy.get('select[data-test="sort"]').select("name,asc");
    cy.wait(1000);

    // Get the items on the current page and verify they are in ascending alphabetical order
    cy.get('[data-test="product-name"]').then(($elements) => {
      const names = [...$elements].map((el) => el.textContent.trim());

      // Check if the array is sorted in ascending alphabetical order
      const isSorted = names.every((value, index, array) => {
        return (
          index === 0 || String(array[index - 1]).localeCompare(value) <= 0
        );
      });

      console.log("Names on current page:", names);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Name (Z - A) using value name,desc", () => {
    // Apply the sort - Name (Z - A)
    cy.get('select[data-test="sort"]').select("name,desc");
    cy.wait(500);

    // Get the items on the current page and verify they are in descending alphabetical order
    cy.get('[data-test="product-name"]').then(($elements) => {
      const names = [...$elements].map((el) => el.textContent.trim());

      // Check if the array is sorted in descending alphabetical order
      const isSorted = names.every((value, index, array) => {
        return (
          index === 0 || String(array[index - 1]).localeCompare(value) >= 0
        );
      });

      console.log("Names on current page:", names);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Price (High - Low) using value price,desc", () => {
    // Apply the sort - Price (High - Low)
    cy.get('select[data-test="sort"]').select("price,desc");
    cy.wait(500);

    // Get the prices on the current page and verify they are in descending order
    cy.get('[data-test="product-price"]').then(($elements) => {
      const prices = [...$elements].map((el) => {
        // Extract numeric value from price text (assuming format like "$19.99")
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      });

      // Check if the array is sorted in descending order (high to low)
      const isSorted = prices.every((value, index, array) => {
        return index === 0 || array[index - 1] >= value;
      });

      console.log("Prices on current page:", prices);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Price (Low - High) using value price,asc", () => {
    // Apply the sort - Price (Low - High)
    cy.get('select[data-test="sort"]').select("price,asc");
    cy.wait(500);

    // Get the prices on the current page and verify they are in ascending order
    cy.get('[data-test="product-price"]').then(($elements) => {
      const prices = [...$elements].map((el) => {
        // Extract numeric value from price text (assuming format like "$19.99")
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      });

      // Check if the array is sorted in ascending order (low to high)
      const isSorted = prices.every((value, index, array) => {
        return index === 0 || array[index - 1] <= value;
      });

      console.log("Prices on current page:", prices);
      expect(isSorted).to.be.true;
    });
  });

  // ----------- Select by LABEL -------------

  it("Sorts by Name (A - Z) using label", () => {
    // Apply the sort using the label text
    cy.get('select[data-test="sort"]').select("Name (A - Z)");
    cy.wait(500);

    // Get the items on the current page and verify they are in ascending alphabetical order
    cy.get('[data-test="product-name"]').then(($elements) => {
      const names = [...$elements].map((el) => el.textContent.trim());

      // Check if the array is sorted in ascending alphabetical order
      const isSorted = names.every((value, index, array) => {
        return (
          index === 0 || String(array[index - 1]).localeCompare(value) <= 0
        );
      });

      console.log("Names on current page:", names);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Name (Z - A) using label", () => {
    // Apply the sort using the label text
    cy.get('select[data-test="sort"]').select("Name (Z - A)");
    cy.wait(500);

    // Get the items on the current page and verify they are in descending alphabetical order
    cy.get('[data-test="product-name"]').then(($elements) => {
      const names = [...$elements].map((el) => el.textContent.trim());

      // Check if the array is sorted in descending alphabetical order
      const isSorted = names.every((value, index, array) => {
        return (
          index === 0 || String(array[index - 1]).localeCompare(value) >= 0
        );
      });

      console.log("Names on current page:", names);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Price (High - Low) using label", () => {
    // Apply the sort using the label text
    cy.get('select[data-test="sort"]').select("Price (High - Low)");
    cy.wait(500);

    // Get the prices on the current page and verify they are in descending order
    cy.get('[data-test="product-price"]').then(($elements) => {
      const prices = [...$elements].map((el) => {
        // Extract numeric value from price text (assuming format like "$19.99")
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      });

      // Check if the array is sorted in descending order (high to low)
      const isSorted = prices.every((value, index, array) => {
        return index === 0 || array[index - 1] >= value;
      });

      console.log("Prices on current page:", prices);
      expect(isSorted).to.be.true;
    });
  });

  it("Sorts by Price (Low - High) using label", () => {
    // Apply the sort using the label text
    cy.get('select[data-test="sort"]').select("Price (Low - High)");
    cy.wait(500);

    // Get the prices on the current page and verify they are in ascending order
    cy.get('[data-test="product-price"]').then(($elements) => {
      const prices = [...$elements].map((el) => {
        // Extract numeric value from price text (assuming format like "$19.99")
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      });

      // Check if the array is sorted in ascending order (low to high)
      const isSorted = prices.every((value, index, array) => {
        return index === 0 || array[index - 1] <= value;
      });

      console.log("Prices on current page:", prices);
      expect(isSorted).to.be.true;
    });
  });
});
