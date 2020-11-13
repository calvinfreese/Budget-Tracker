const indexedDB =  
window.indexedDB || 
window.mozIndexedDB || 
window.webkitIndexedDB || 
window.msIndexedDB;


let db;
let request= window.indexedDB.open("workoutsdb", 1);

request.onupgradeneeded = function({ target }) { 
  let database = target.result;
  database.createObjectStore("items", { autoIncrement: true  });

};

request.onerror = function(event) {
    console.log("App errored on attempt to use IndexedDB " + event.target.errorCode);
};

request.onsuccess = function({ target }) {
    db = target.result;

    getDatabase();
}

function saveRecord(data){
    const transaction = db.transaction(["items"], "readwrite");
    const store = transaction.objectStore("items");

    store.add(data);

}

function getDatabase() {
    const transaction = db.transaction(["items"], "readwrite");
    const store = transaction.objectStore("items");
    const getAll = store.getAll();
    
    getAll.onsuccess = function() {
        if(getAll.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
                })
                .then(response => {        
                    return response.json();
                })
                .then(() => {
                // delete records if successful
                    const transaction = db.transaction(["items"], "readwrite");
                    const store = transaction.objectStore("items");
                    store.clear();
                });
            }
    }
}







window.addEventListener("online", getDatabase);