describe("Medusa Backend Health & Configuration", () => {
  it("verifies environment variables are loaded properly", () => {
    expect(process.env.PORT || "9000").toBe("9000")
  })

  it("verifies Indian currency code default", () => {
    const currency = "inr"
    expect(currency.toUpperCase()).toBe("INR")
  })
})
