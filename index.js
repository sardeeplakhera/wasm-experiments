var MB = 1024 * 1024;

var logToInfo = function(message) {
    console.log(message);
    var p = document.createElement("p");
    p.innerText = message;
    document.getElementById("info").appendChild(p);
}

var logMemoryStatus = function () {
    var memoryStatus = `WASM Memory Used ${Module.wasmMemoryUsed()}MB Reserved Memory: ${Module.reservedMemory()}MB`;
    logToInfo(memoryStatus);
}

var logBitmapCacheStatus = function () {
    var bitmapCacheStatus = `Bitmap cache total: ${Module.bitmapCacheTotal() / MB}, Bitmap cache in Mem: ${Module.bitmapCacheInMem() / MB}`;
    logToInfo(bitmapCacheStatus);
    var bitmapCountDetails = `Bitmap total: ${Module.bitmapTotalInMem()}, DataStore Mem: ${Module.dataInMem()}, DataStore DB: ${Module.dataInDB()}`;
    logToInfo(bitmapCountDetails);
}

var interval = -1;
var tryThrice = 3;

function loadImages() {
    var imageCount = Number(document.getElementById("imageLoader").value);
    var numOfImagesLoaded = 0;
    var failure = false;
    interval = setInterval(() => {
        if (numOfImagesLoaded === imageCount || failure) {
            clearInterval(interval);
            logMemoryStatus();
            logBitmapCacheStatus();
            Module.dumpDataStore();
            return;
        }
        logMemoryStatus();
        logBitmapCacheStatus();
        if (Module.reservedMemory() == 0 && tryThrice > 0) {
            tryThrice = tryThrice - 1;
            logToInfo("WILL ATTEMPT AUTO RESERVE MEMORY");
            try {
                Module.autoReserveMemory();
            } catch {
                logToInfo("AUTO RESERVE MEMORY THROW");
                Module.resetFreeReserveMemoryFlag();
            }
            logToInfo("AUTO RESERVE MEMORY " + Module.reservedMemory());
        }
        var res = false;
        try {
            res = Module.allocateImage();
        } catch {
            console.log("ALLOCATE IMAGE THREW");
        }
        var allocStatus;
        if (res) {
            numOfImagesLoaded++;
            allocStatus = `${numOfImagesLoaded} Images loaded`;
        } else {
            allocStatus = "Image Load failure";
            failure = true;
        }
        logToInfo(allocStatus);
    }, 200)
}