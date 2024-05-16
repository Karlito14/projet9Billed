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
      // Instance NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Simulation chargement fichier
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      inputFile.addEventListener("change", handleChangeFile);

      fireEvent.change(inputFile, {
        target: {
          files: [new File(["test.txt"], "test.txt", { type: "image/txt" })],
        },
      });

      // Message erreur
      const error = screen.getByTestId("errorFile");
      expect(error).toBeTruthy();
    });
  });

  describe("when I choose the wrong date", () => {
    test("Then it should display an error message", () => {
      document.body.innerHTML = NewBillUI();
      // Instance NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Simulation chargement fichier
      const handleChangeDate = jest.fn(() => newBill.handleChangeDate);
      const inputDate = screen.getByTestId("datepicker");

      inputDate.addEventListener("change", handleChangeDate);

      const today = new Date()
      const day = today.getDate()
      const month = today.getMonth() + 1
      const year = today.getFullYear()

      fireEvent.change(inputDate, {
        target: {
          value: `2024-05-17`,
        },
      });

      // Message erreur
      const error = screen.getByTestId("errorDate");
      expect(error).toBeTruthy();
    });
  });
})
