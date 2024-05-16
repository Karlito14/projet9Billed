/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill should be render", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  describe("When I upload a file with invalid format", () => {
    test("Then it should display an error message", () => {
      document.body.innerHTML = NewBillUI();
      //Instanciation class NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      //simulate loading file
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      //Listen charging file
      inputFile.addEventListener("change", handleChangeFile);

      //Simulate it with FireEvent
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["test.txt"], "test.txt", { type: "image/txt" })],
        },
      });

      //An error message have to appear
      const error = screen.getByTestId("errorFile");
      expect(error).toBeTruthy();
    });
  });
})
