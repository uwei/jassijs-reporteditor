var RUNTIME = 'runtime58';

var nextid = 0;
var tempFiles = {};
// A list of local resources we always want to be cached.


//index db deliver files
var filesdb;
//deliver local folder
var localfolderdb;

async function loadLocalFileEntry(handle,fileName){
  if (fileName.startsWith("./"))
      fileName = fileName.substring(2);
  if (fileName.startsWith("."))
      fileName = fileName.substring(1);
  if (fileName === "")
      return handle;
  var paths = fileName.split("/");

  var ret = handle;
  for (var x = 0; x < paths.length; x++) {
      try {
          ret = await ret.getDirectoryHandle(paths[x]);
      } catch {
          try {
              ret = await ret.getFileHandle(paths[x]);
          } catch {
              return undefined;
          }
      }
  }
  return ret;
}
async function findLocalFolder(fileName) {
  if (localfolderdb)
    await localfolderdb;
  else {
    localfolderdb = await new Promise((res) => {
      var req = indexedDB.open("handles", 3);
      req.onupgradeneeded = function (ev) {
        var db = ev.target["result"];
        var objectStore = db.createObjectStore("handles");
      }

      req.onsuccess = (ev) => {
        res(ev.target["result"])
      };
      req.onerror = function (ev) {
        res(undefined);
      }
    })
  }
  let transaction = localfolderdb.transaction("handles", 'readwrite');
  const store = transaction.objectStore("handles");
  var ret = await store.get("handle");
  var handle = await new Promise((resolve) => {
    ret.onsuccess = ev => { resolve(ret.result) }
    ret.onerror = ev => { resolve(undefined) }
  });

  if (handle===undefined||(await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
    return false;
  }
 
    //  console.log("service" + e.value[0]);
    var ent=await loadLocalFileEntry(handle,"./client/"+fileName);
    if(ent===undefined)
      return false;
    var ff = await ent.getFile();
    return await ff.text();
}


async function loadFileFromDB(fileName) {
  if (filesdb)
    await filesdb;
  else {

    filesdb = await new Promise((res) => {
      var req = indexedDB.open("jassi", 1);
      req.onupgradeneeded = function (ev) {
        var db = ev.target["result"];
        var objectStore = db.createObjectStore("files", { keyPath: "id" });
      }
      req.onsuccess = (ev) => {
        res(ev.target["result"])
      };
      req.onerror = function (ev) {
        console.log(ev);
      }
    })
  }
  let transaction = filesdb.transaction('files', 'readonly');
  const store = transaction.objectStore('files');
  var ret = await store.get("./client/" + fileName);
  var r = await new Promise((resolve) => {
    ret.onsuccess = ev => { resolve(ret.result) }
    ret.onerror = ev => { resolve(undefined) }
  });
  return (r !== undefined ? r.data : undefined);
}
function getMimeType(filename) {
  var type = "application/javascript";
  if (filename.endsWith(".ts"))
    type = "video/mp2t";
  if (filename.endsWith(".map"))
    type = "text/html; charset=utf-8";
  return type;
}

var localRemoteProtocolList = {};
async function doLocalRemoteProtocol(evt) {
  var body = await evt.request.clone().json();
  var client = await self.clients.get(evt.clientId);
  var id = nextid++;

  client.postMessage({ type: "REQUEST_REMOTEPROTCOL", data: body, id });
  var waitForMessage = await new Promise((resolve) => {
    localRemoteProtocolList[id] = function (data) {
      resolve(data.data);
    };
  });
  if (waitForMessage === "***POST_TO_SERVER***")
    return "***POST_TO_SERVER***";
  return new Response(waitForMessage);
}

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {

  const currentCaches = [RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

//var todoAfterLoggedin = [];
var isLocalRemoteprotocolActivated = {};//{clientid}:true
self.addEventListener('message', function (evt) {
  if (evt.data && evt.data.type === "SAVE_FILE") {//this tempFiles could be delivered
    console.log(evt.data.filename);
    tempFiles[evt.data.filename] = evt.data.code;
    evt.ports[0].postMessage({ result: "ok" });
  }
  else if (evt.data && evt.data.type === "LOGGED_IN") {
    console.log("logged in");
    /*todoAfterLoggedin.forEach((entr) => {
      entr();
    })*/
  } else if (evt.data && evt.data.type === "RESPONSE_REMOTEPROTCOL") {
    localRemoteProtocolList[evt.data.id](evt.data);
    delete localRemoteProtocolList[evt.data.id];
  } else if (evt.data && evt.data.type === "ACTIVATE_REMOTEPROTCOL") {
    isLocalRemoteprotocolActivated[evt.source.id] = true;
  } else
    console.log('postMessage received', evt);

});

/*async function refetchIfNeeded(url, event, response) {
  if (response.status === 401) {//now we display an Logindialog and pause the request
    let client = await self.clients.get(event.clientId);
    client.postMessage(`wait for login`);
    await new Promise((resolve) => {
      todoAfterLoggedin.push(resolve);
    });
    var newresponse = fetch(url, { cache: "no-store" });
    await newresponse;
    return newresponse;
  } else {
    return response;
  }
}*/

async function handleEvent(event) {
  if (isLocalRemoteprotocolActivated[event.clientId] && event.request.method === "POST" && event.request.url.indexOf("/remoteprotocol?") !== -1) {
    var ret = await doLocalRemoteProtocol(event);
    if (ret !== "***POST_TO_SERVER***")
      return ret;

  }
  if (event.request.method === "POST" || event.request.url.indexOf("/remoteprotocol?") !== -1) {

    let res = await fetch(event.request);
    if (res.status === 401 || res.status === 500) {//now we display an Logindialog and pause the request
      var client = await self.clients.get(event.clientId);
      client.postMessage(`wait for login`);
      console.log("wait for login");
    }
    return res;
  }

  //let cache = await caches.open(RUNTIME)
  var filename = event.request.url;
  if (tempFiles[filename]) {//we deliver tempFiles
    console.log("deliver " + filename + tempFiles[filename].substring(0, 50));
    return new Response(tempFiles[filename], {
      headers: { "Content-Type": getMimeType(filename) }
    });
  }
  var sfilename = filename.replace(self.registration.scope, "");
  var content = await findLocalFolder(sfilename);
  if(!content)
    content=await loadFileFromDB(sfilename);
  if (content !== undefined) {
    return new Response(content, {
      headers: { "Content-Type": getMimeType(filename) }
    });
  } /*else {
    let response = await cache.match(event.request);
    var fromCache = event.request.headers.get("X-Custom-FromCache");
    //we needn't ask the server if a newer version exists 
    if (response && fromCache !== undefined && fromCache !== null &&
      fromCache === response.headers.get("X-Custom-Date")) {
      return response;
    }
    if (event.request.url.startsWith(self.location.origin) && response) {
      //we check if the cache is still current
      var dat = response.headers.get("X-Custom-Date");
      var s = event.request.url + "?lastcachedate=" + dat;
      if (event.request.url.indexOf("?") > 0) {
        s = event.request.url + "&lastcachedate=" + dat;
      }
      // if (dat !== undefined&&dat !== null) {
      let networkResponse = await fetch(s, { cache: "no-store" });
      //networkResponse = await refetchIfNeeded(s, event, networkResponse);
      if (networkResponse.headers.get("X-Custom-UpToDate") === "true") {
        return response;//server says the cache is upToDate
      } else {
        //server has new data
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      }

      // } else
      // return response;
    }
    if (response) {
      //external sites
      if (event.request.url.endsWith("?version=newest")) {//here we deliver the cache only if filesize in cache is the same
        let test = await fetch(event.request, { cache: "no-store",method:"HEAD" });
        if(test.headers.get("content-length")===response.headers.get("content-length"))
          return response;
      } else
          return response;
    }*/
  //not in cache so cache now
  let networkResponse = await fetch(event.request);
  if (networkResponse.status === 401) {//now we display an Logindialog and pause the request
    self.clients.get(event.clientId).then((client) => {
      client.postMessage(`wait for login`);
      console.log("wait for login");
    });
  }

  //cache.put(event.request, networkResponse.clone());
  //console.log("cache+ " + event.request.url);
  return networkResponse;

}
// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
var openrequests = [];


self.addEventListener('fetch', event => {
  var pr = handleEvent(event);

  event.respondWith(pr);
  //  event.waitUntil(pr);
});//self.addEventListener('fetch'

