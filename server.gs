

// CONFIGURATION
const configArray = [];

function loadConfigurations() {
  const settingsSheet = getSheet("settings");
  const settingsRange = settingsSheet.getRange(5, 1, settingsSheet.getLastRow() - 4, settingsSheet.getLastColumn()).getValues();
  
  
  settingsRange.forEach(item => {
    const config = {
      "len":lenFunction(item[0]),
      "title": item[0],
      "min": item[1],
      "minColor": item[2],
      "max": item[3],
      "maxColor": item[4],
      "data": formatDate(item[5]),
      "listDel":item[6],
    };
    configArray.push(config);
  });
  
  return configArray;
}
// == ROUTING == 
function render(label) {
  const template = HtmlService.createTemplateFromFile('base');
  template.isLabel = label;
  template.listApp = getAllBottomSheets(label);
  return template.evaluate();
}
function doGet(e) {
  let label;
  const settingsSheet = getSheet("settings");
  const settingsRange = settingsSheet.getRange(5, 1, settingsSheet.getLastRow() - 4, settingsSheet.getLastColumn()).getValues();

  for (let i = 0; i < settingsRange.length; i++) {
    if (e.parameters.v == i) {
      label = settingsRange[i][0];
      return render(label);
    }
  }
  label = 'test';
  return render(label);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//  == UTILS ==

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
}
function calculateAverage(list) {
  const sum = list.reduce((acc, curr) => parseInt(acc) + parseInt(curr), 0);
  return Math.floor(sum / list.length);
}
function calculateSum(list) {
  const sum = list.reduce( (acc,curr) => acc + parseInt(curr),0 )
  return Math.floor(sum)
}
function lenFunction(label){
  const sheet = getSheet(label);
  const items = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getValues()[0];
  return items.length
}

//  === CONTAINER =========
function tableLister(label) {
  const sheet = getSheet(label);
  const items = sheet.getRange(3, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const sortElemet = sortList(label)
  const headElemet = items[0].slice(1)

 return sortElemet.map( item => headElemet.indexOf(item))

}

function sortList(label){
  const configArray = loadConfigurations()
  const filterConfig = configArray.filter(item => item.title == label)[0]
  return filterConfig.listDel.split(',')
}

function populateModalInformation(title) {

    const configArray = loadConfigurations();
    const modalInfo = [];

    configArray.forEach(config => {
      const sheet = getSheet(config.title);
      const items = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getValues().slice(1);

      const filteredItem = items.filter(item =>  {
        const uotFind = item[0].replaceAll(' ','').replace(/"/g, '').toLocaleLowerCase()
        const alFind =  title.replaceAll(' ','').replace(/"/g, '').toLocaleLowerCase()
        if(uotFind == alFind) {
          return item
        }
        return 0
      })[0];
      const count = calculateAverage(filteredItem.slice(1));
      modalInfo.push({
        ...config,
        count
      });
    });
    return modalInfo;
}

function getAllBottomSheets(label) {
  const sheet = getSheet(label);
  const items = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).getValues();

  return {
    thead: items[0],
    tbody: items.slice(1)
  };
}

function generateChartElements(label) {
  const sheet = getSheet(label);
  const items = sheet.getRange(3, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const chartElements = [];


  const sortElemet = sortList(label)
  const headElemet = items[0].slice(1)

  const indexListSort = sortElemet.map( item => headElemet.indexOf(item))
  


  items.slice(1).forEach( item => {
    if(item[0]  != ''){
      const title = item[0];
      const data = item.slice(1).filter((el,index) => {
       if(!indexListSort.includes(index)){
        return parseInt(el == 0 ? 1:el)
       }
      })
      const avg = calculateAverage(data.map(el => parseInt(el)));
      chartElements.push([title, avg]);
    }

  });
  return chartElements;
}

function getAsideList(label) {
  const sheet = getSheet(label);
  const items = sheet.getRange(3, 1, sheet.getLastRow() - 6, sheet.getLastColumn()).getValues();
  return items.slice(1).map(item => item[0]);
}

