'use strict';

const HOST = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = '759c7f23-7978-40b0-be25-b616c37640d0'

 
let routesData;
let filteredRoutes;
let guideServiceCost; 
const itemsPerPage = 10;
let currentPage = 1;


function clearTable() {
    const tableBody = document.getElementById('routesTable');
    tableBody.innerHTML = '';
}

function addRoutesToTable(routes) {
    const tableBody = document.getElementById('routesTable');
  
    routes.forEach(route => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerHTML = route.name;
        row.insertCell(1).innerHTML = route.description;
        row.insertCell(2).innerHTML = route.mainObject;

        const selectButton = document.createElement('button');
        selectButton.innerText = 'Выбрать';
        selectButton.addEventListener('click', () => guideDownload(route.id));
        row.insertCell(3).appendChild(selectButton);
    });
}
  
function fetchRoutesFromApi() {
    fetch(
        `${HOST}/api/routes?api_key=${API_KEY}`
    )
        .then(response => response.json())
        .then(data => {
            routesData = data;
            updateTable();
        })
        .catch(error => console.error('Error fetching route data:', error));
}

function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRoutes = filteredRoutes ?
        filteredRoutes.slice(startIndex, endIndex) :
        routesData.slice(startIndex, endIndex);
  
    clearTable();
    addRoutesToTable(currentRoutes);
    updatePagination();
    
    const searchKeyword = document.getElementById('routeNameInput')
        .value.toLowerCase();

    if (searchKeyword) {
        highlightSearchResult(searchKeyword);
    }
}
  

function clickHandler(event) {
    const screen = document.querySelector('.screen');
    const target = event.target;
    const row = document.querySelectorAll('th');
    let id = 0;
    if (target.classList.contains('choose')) {
        for (let i = 6; i < row.length; i++) {
            if (target.id == row[i].id) {
                row[i].classList.add('table-success');
                id = row[i].getAttribute('name');
            } else {
                row[i].classList.remove('table-success');
            }
        }
    }
}
function guideDownload(id) {
    let guideTable = document.querySelector('.guide-table');
    let languageOptions = new Set();
    fetch(`${HOST}/api/routes/${id}/guides?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(guides => {
            guideTable.innerHTML = '';
            guides.forEach(guide => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td><img src="img/user.jpg"></td>
                    <td>${guide.name}</td>
                    <td>${guide.language}</td>
                    <td>${guide.workExperience}</td>
                    <td>${guide.pricePerHour}</td>
                `;
                let selectCell = document.createElement('td');
                let selectButton = document.createElement("button");
                selectButton.textContent = 'Выбрать';
                selectButton.classList.add('choose-button');
                selectButton.addEventListener('click', () => openModal(guide.name, 'Название маршрута', guide.language, guide.workExperience, guide.pricePerHour));
                selectCell.appendChild(selectButton);
                row.appendChild(selectCell);
                guideTable.appendChild(row);

                languageOptions.add(guide.language);
            });
            removeOptions(document.getElementById('select_language'));
            createselect(Array.from(languageOptions));
        })
        .catch(error => console.error('Ошибка при получении данных о гидах:', error));
}

function searchRoutes() {
    const searchKeyword = document.getElementById('routeNameInput')
        .value.toLowerCase();
    const selectedObject = document.getElementById('mainObjectSelect')
        .value.toLowerCase();
  
    filteredRoutes = routesData.filter(route => 
        route.name.toLowerCase().includes(searchKeyword) &&
        route.mainObject.toLowerCase().includes(selectedObject)
    );
  
    const limitedRoutes = filteredRoutes.slice(0, itemsPerPage);
  
    clearTable();
    addRoutesToTable(limitedRoutes);
    updatePaginationAfterSearch(filteredRoutes);
    highlightSearchResult(searchKeyword);
}
  
function resetSearch() {
    document.getElementById('routeNameInput').value = '';
    document.getElementById('mainObjectSelect').value = '';
    filteredRoutes = null;
    updateTable();
}

  
function updatePagination() {
    const paginationElement = document.getElementById('pagination');
    const totalPages = Math.ceil((filteredRoutes ?
        filteredRoutes.length : 
        routesData.length) / itemsPerPage);
  
    paginationElement.innerHTML = '';
  
    const prevItem = createPaginationItem('Предыдущая', currentPage - 1);
    paginationElement.appendChild(prevItem);
  
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = createPaginationItem(i, i);
      paginationElement.appendChild(pageItem);
    }
  
    const nextItem = createPaginationItem('Следующая', currentPage + 1);
    paginationElement.appendChild(nextItem);
}
  
function createPaginationItem(text, pageNumber) {
    const pageItem = document.createElement('li');
    pageItem.className = 'page-item';
  
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = 'javascript:void(0)';
    pageLink.innerText = text;
  
    if (
        (text === 'Previous' && currentPage === 1) ||
        (text === 'Next' && 
            currentPage === Math.ceil((filteredRoutes ? 
                filteredRoutes.length : routesData.length) / itemsPerPage)
        )) {
        pageItem.classList.add('disabled');
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            handlePageClick(pageNumber);
        });
    } else {
        pageLink.addEventListener('click', () => handlePageClick(pageNumber));
    }
 
    if (pageNumber === currentPage) {
        pageItem.classList.add('active');
    }
  
    pageItem.appendChild(pageLink);
  
    return pageItem;
}
  
function updatePaginationAfterSearch(filteredRoutes) {
    const paginationElement = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  
    paginationElement.innerHTML = '';
  
    const prevItem = createPaginationItem('Previous', currentPage - 1);
    paginationElement.appendChild(prevItem);
  
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = createPaginationItem(i, i);
        paginationElement.appendChild(pageItem);
    }
  
    const nextItem = createPaginationItem('Next', currentPage + 1);
    paginationElement.appendChild(nextItem);
}
  
function handlePageClick(pageNumber) {
    currentPage = pageNumber;
    updateTable();
}
  
function highlightSearchResult(searchKeyword) {
    const tableBody = document.getElementById('routesTable');
    const rows = tableBody.getElementsByTagName('tr');
  
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const nameCell = cells[0];

        const cellValue = nameCell.innerText;

        const lowerCaseCellValue = cellValue.toLowerCase();
        const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
  
        if (lowerCaseCellValue.includes(lowerCaseSearchKeyword)) {
            const startIndex = lowerCaseCellValue.indexOf(lowerCaseSearchKeyword);
            const endIndex = startIndex + searchKeyword.length;
  
            const highlightedText = cellValue.substring(0, startIndex) +
          `<span class="search-highlight">${cellValue.substring(startIndex, endIndex)}</span>` +
            cellValue.substring(endIndex);
  
            nameCell.innerHTML = highlightedText;
        }
    }
}

function guideOptions() {
    let list = document.querySelectorAll('.guide-table tr');
    let from = Number(document.getElementById('guide-input-expfrom').value);
    let to = Number(document.getElementById('guide-input-expto').value);
    for (let i in list) {
        if ((from == 0 || from <= list[i].cells[3].innerHTML) &&
        (to == 0 || to >= list[i].cells[3].innerHTML) &&
        (document.getElementById('select_language')
            .options[document.getElementById('select_language').selectedIndex]
            .innerHTML == 'Язык экскурсии' ||
        document.getElementById('select_language')
            .options[document.getElementById('select_language').selectedIndex]
            .innerHTML == list[i].cells[2].innerHTML)) {

            list[i].classList.remove("d-none");
        } else {
            list[i].classList.add("d-none");
        }
        console.log(list[i].cells[2].innerHTML);
    }
}

function getoptionforselect(q) {
    return [... new Set(q)];    
}

function removeOptions(selectElement) {
    let i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
    const selects = document.getElementById('select_language');
    let option = document.createElement('option');
    option.value = "";
    option.innerHTML = "Язык экскурсии";
    selects.appendChild(option);
}  

function createselect(arr) {
    const select = document.getElementById('select_language');
    for (let i in arr) {
        console.log(arr[i]);
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = arr[i];
        select.appendChild(opt);
    }  
}


function openModal(guideName, routeName, language, workExperience, pricePerHour) {
    document.getElementById('modalGuideName').textContent = guideName;
    document.getElementById('modalRouteName').textContent = routeName;
    document.getElementById('modalLanguage').textContent = language;
    document.getElementById('modalWorkExperience').textContent = workExperience;
    document.getElementById('modalPricePerHour').textContent = pricePerHour;
    guideServiceCost = pricePerHour;
    calculateTotalPrice();

    var modal = document.getElementById('myModal');
    modal.style.display = 'block';
}


function calculateTotalPrice() {
    let pricePerHour = parseFloat(document.getElementById('modalPricePerHour').textContent);
    let duration = parseInt(document.getElementById('duration').value, 10); 
    let peopleCount = parseInt(document.getElementById('peopleCount').value, 10);
    let time = document.getElementById('time').value; 

    let totalPrice = pricePerHour * duration; 

    totalPrice += isMorning(time) ? 400 : 0;
    totalPrice += isEvening(time) ? 1000 : 0;

    if (peopleCount > 5 && peopleCount <= 10) {
        totalPrice += 1000;
    } else if (peopleCount > 10 && peopleCount <= 20) {
        totalPrice += 1500;
    }

    if (document.getElementById('pensionerDiscount').checked) {
        totalPrice *= 0.75; 
    }
    if (document.getElementById('interactiveGuide').checked) {
        totalPrice *= 1.5; 
    }


    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2) + ' руб.';
}


    
  function isMorning(time) {

    return time >= '09:00' && time < '12:00';
  }
  
  function isEvening(time) {
    return time >= '20:00' && time <= '23:00';
  }
  
  function closeModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

  document.querySelectorAll('.choose-button').forEach(button => {
    button.addEventListener('click', openModal);
  });
  var closeButton = document.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', function(event) {
    var modal = document.getElementById('myModal');
    if (event.target === modal) {
      closeModal();
    }
  });
  

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

window.onload = function() {
    document.getElementById('duration').addEventListener('change', calculateTotalPrice);
    document.getElementById('peopleCount').addEventListener('change', calculateTotalPrice);
    document.getElementById('time').addEventListener('change', calculateTotalPrice);
    document.getElementById('guide-input-expfrom').oninput = guideOptions;
    document.getElementById('guide-input-expto').oninput = guideOptions;
    document.getElementById('select_language').onchange = guideOptions;
    document.getElementById('pensionerDiscount').addEventListener('change', calculateTotalPrice);
    document.getElementById('interactiveGuide').addEventListener('change', calculateTotalPrice);
    const table = document.querySelector('.table');
    table.addEventListener('click', clickHandler);
    document.getElementById('duration').addEventListener('change', function() {
        calculateTotalPrice(guideServiceCost);
    });
    document.getElementById('peopleCount').addEventListener('change', function() {
        calculateTotalPrice(guideServiceCost);
    });
    document.getElementById('time').addEventListener('change', function() {
        calculateTotalPrice(guideServiceCost);
    });
    fetchRoutesFromApi();
};
