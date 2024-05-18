/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // test affichage page nouvelle note de frais
    test("Then the newBill should be render", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  // test affichage message d'erreur lorsque l'utilisateur choisi un fichier avec la mauvaise extension
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

  // test affichae message erreur lorsque l'utilisateur choisi une mauvaise date
  describe("when I choose the wrong date", () => {
    test("Then it should display an error message", () => {
      document.body.innerHTML = NewBillUI();
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleChangeDate = jest.fn(() => newBill.handleChangeDate);
      const inputDate = screen.getByTestId("datepicker");

      inputDate.addEventListener("change", handleChangeDate);

      const today = new Date()
      const day = today.getDate()
      let month = today.getMonth() + 1
      const year = today.getFullYear()

      // rajouter une condition pour month
      month = month < 10 ? '0' + month : ''

      fireEvent.change(inputDate, {
        target: {
          value: `${year}-${month}-${(day + 1)}`,
        },
      });
      
      const error = screen.getByTestId("errorDate");
      expect(error).toBeTruthy();
    });
  });

  // test lorsque le formulaire est correctement rempli
  describe("When I submit the form completed", () => {
    test("Then the bill is created", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const validBill = {
        type: "Restaurants et bars",
        name: "Vol Paris Londres",
        date: "2024-02-15",
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: "Commentary",
        fileUrl: "../img/0.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;

      newBill.fileName = validBill.fileName;
      newBill.fileUrl = validBill.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  });
})
