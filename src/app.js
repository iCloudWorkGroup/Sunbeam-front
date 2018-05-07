import SBM from './sbm';

//由页面获取
window.SPREADSHEET_AUTHENTIC_KEY = '1e624f96-17ac-44f5-9def-fe989a1f6bec';

let sbm = new SBM('app');


// let element1 = document.getElementById('frozen');
// let element2 = document.getElementById('unfrozen');
// let element3 = document.getElementById('insertrow');
// let element4 = document.getElementById('insertcol');
// let element5 = document.getElementById('deletecol');
// let element6 = document.getElementById('deleterow');
// let element7 = document.getElementById('rowoper');
// let element8 = document.getElementById('coloper');
// let element9 = document.getElementById('colhide');
// let element10 = document.getElementById('colcancelhide');
// let element11 = document.getElementById('rowhide');
// let element12 = document.getElementById('rowcancelhide');

let element13 = document.getElementById('fillcolor');

// element1.addEventListener('click',function(e){
// 	store.dispatch('SHEET_FROZEN');
// },false);
// element2.addEventListener('click',function(e){
// 	store.dispatch('SHEET_UNFROZEN');
// },false);
// element3.addEventListener('click',function(e){
// 	store.dispatch('ROWS_INSERTROWS');
// },false);
// element4.addEventListener('click',function(e){
// 	store.dispatch('COLS_INSERTCOLS');
// },false);
// element5.addEventListener('click',function(e){
// 	store.dispatch('COLS_DELETECOLS');
// },false);

// element6.addEventListener('click',function(e){
// 	store.dispatch('ROWS_DELETEROWS');
// },false);

// element7.addEventListener('click',function(e){
// 	store.dispatch('ROWS_OPERROWS',{props:{content: {background: 'rgb(0,0,0)'}}});
// },false);

// element8.addEventListener('click',function(e){
// 	store.dispatch('COLS_OPERCOLS',{props:{content: {background: 'rgb(0,0,0)'}}});
// },false);

// element9.addEventListener('click',function(e){
// 	store.dispatch('COLS_HIDE');
// },false);
// element10.addEventListener('click',function(e){
// 	store.dispatch('COLS_CANCELHIDE');
// },false);
// element11.addEventListener('click',function(e){
// 	store.dispatch('ROWS_HIDE');
// },false);
// element12.addEventListener('click',function(e){
// 	store.dispatch('ROWS_CANCELHIDE');
// },false);
// 
element13.addEventListener('click',function(e){
	sbm.setFillColor('1', 'rgb(0, 0, 0)');
},false);