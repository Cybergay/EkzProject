'use strict';

const HOST = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = '759c7f23-7978-40b0-be25-b616c37640d0'

 
let routesData;
let filteredRoutes;
  
const itemsPerPage = 10;
let currentPage = 1;


function clearTable() {
    const tableBody = document.getElementById('routesTableBody');
    tableBody.innerHTML = '';
}

function addRoutesToTable(routes) {
    const tableBody = document.getElementById('routesTableBody');
  
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


window.onload = function() {
    const table = document.querySelector('.table');
    table.addEventListener('click', clickHandler);
    fetchRoutesFromApi();
};