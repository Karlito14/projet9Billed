import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

const EXTENSION_FILES = ['png', 'jpeg', 'jpg'];

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    this.error = false
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const extension = fileName.split('.').at(-1)
    let error = this.document.querySelector('.error-file')
    if (EXTENSION_FILES.includes(extension)) {
      this.error = false
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
      
      if(error) {
        error.remove();
      }
  
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({filePath, key, fileName}) => {
          this.billId = key
          this.fileUrl = filePath
          this.fileName = fileName
        }).catch(error => console.error(error))
    } else {
      this.error = true;
      const inputFile = this.document.querySelector('#file')
      if(!error) {
        error = this.document.createElement('p')
        error.textContent = 'Veuillez ajouter une image au format PNG, JPG ou JPEG'
        error.classList.add('error-file')
        inputFile.after(error)
      }
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    const inputDate = e.target.querySelector(`input[data-testid="datepicker"]`)
    const dateSelected = inputDate.value.split('-')
    const daySelected = dateSelected[2]
    const monthSelected = dateSelected[1]
    const yearSelected = dateSelected[0]
    const today = new Date()
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    let errorDate = this.document.querySelector('.error-date')

    if(!errorDate) {
      errorDate = this.document.createElement('p')
      errorDate.textContent = 'Veuillez sélectionner une date précédent la date d\'ajourd\'hui'
      errorDate.setAttribute('class', 'error-date')
    }
    
    if (yearSelected > year) {
      this.error = true
    } else if (yearSelected == year && monthSelected > month) {
      this.error = true    
    } else if (yearSelected == year && monthSelected == month && daySelected > day) {
      console.log('ok')
      this.error = true
    } else {
      this.error = false
    }

    this.error ? inputDate.after(errorDate) : errorDate.remove()

    console.log(this.error)

    if(!this.error) {
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}