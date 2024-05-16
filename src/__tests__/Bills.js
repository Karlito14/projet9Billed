/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on a eye icon", () => {
    test("Then a modal should be display", () => {
      Object.defineProperty(window, localStorage, {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      );

      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const bill = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: null,
      });

      $.fn.modal = jest.fn();

      const handleClickIconEye = jest.fn(() => {
        bill.handleClickIconEye;
      });
      const eyeIcons = screen.getAllByTestId("icon-eye");

      for (let eyeIcon of eyeIcons) {
        handleClickIconEye(eyeIcon);
        userEvent.click(eyeIcon);
      }

      expect(handleClickIconEye).toHaveBeenCalledTimes(eyeIcons.length);
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
})
