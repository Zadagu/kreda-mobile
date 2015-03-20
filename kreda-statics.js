/**
 * Created by kilian on 05.12.14.
 */
//******************************************************
// kreda.storage.store.content
//******************************************************
/* static class methods: */
kreda.storage.store.content.insertQuiet = function(id, content) {
    kreda.storage.insert('content', {id: id, value: content}, id);
};
/**
 *
 * @param jQueryObj
 * @param {kreda.storage.TransaktionenCounter} [count]
 */
kreda.storage.store.content.initializeContent = function(jQueryObj, count) {
    //count = count || new kreda.storage.TransaktionenCounter();
    count = (typeof count === "undefined") ? new QDBCounter() : count;
    var id = jQueryObj.attr("data-content-id");
    if(id != "") {
        count.add();
        var transaction = kreda.storage.idb.transaction('content', 'readonly').objectStore("content").get(id);
        transaction.onsuccess = function () {
            if(transaction.result) {
                jQueryObj.html(transaction.result.value);
                kreda.log("'" + id + "' wurde geladen");
                kreda.event.callevent("content-initialisiert:" + id);
                count.finishedOperation();
            }
            else {
                count.failedOperation();
            }
        };
        transaction.onerror = function () {
            count.failedOperation();
        }
    }
};
//******************************************************
// kreda.storage.store.schueler
//******************************************************
/**
 * ein Objekt in die Datenbank einfügen, ohne eine Änderung zu vermerken
 * @param obj {kreda.storage.store.schueler}
 * @static
 */
kreda.storage.store.schueler.insertObjQuiet = function(obj) {
    var transaction = kreda.storage.idb.transaction('schueler', 'readwrite').objectStore("schueler").add(obj);
    transaction.onsuccess = function(event) { kreda.log("Schüler '" + obj.vorname + " " + obj.name + "' wurde gespeichert."); };
    transaction.onerror = function(event) { kreda.log("Schüler '" + obj.vorname + " " + obj.name + "' konnte nicht gespeichert werden."); };
};
//**************************************************************************************
// kreda.storage.store.sitzplan
//**************************************************************************************
kreda.storage.store.sitzplan.insertQuiet = function(id, name, aktiv, user) {
    kreda.storage.insert('sitzplan', {id: id, name: name, aktiv: aktiv, user: user}, id);
};
//**************************************************************************************
// kreda.storage.store.sitzplan_klasse
//**************************************************************************************
kreda.storage.store.sitzplan_klasse.insertQuiet = function(id, name, klasse, seit, sitzplan) {
    kreda.storage.insert('sitzplan_klasse', {id: id, name: name, klasse: klasse, seit: seit, sitzplan: sitzplan}, id);
};
/** @static */
kreda.storage.store.sitzplan_platz.insertQuiet = function(id, sitzplan_klasse, sitzplatz_id, schueler) {
    kreda.storage.insert('sitzplan_platz', {id: id, sitzplan_klasse: sitzplan_klasse, sitzplatz_id: sitzplatz_id, schueler: schueler}, id);
};
/** @static */
kreda.storage.store.sitzplan_platz.add = function(sitzplan_klasse, sitzplatz_id, schueler, counter) {
    var transaction = kreda.storage.idb.transaction('sitzplan_platz', 'readwrite').objectStore("sitzplan_platz").add({sitzplan_klasse: sitzplan_klasse, sitzplatz_id: sitzplatz_id, schueler: schueler});
    //counter = counter || new QDBCounter();
    counter = (typeof counter === "undefined") ? new QDBCounter() : counter;
    counter.add();
    transaction.onsuccess = function(e) {
        counter.finishedOperation();
        kreda.storage.store.changes.saveQuiet('sitzplan_platz', e.target.result, kreda.storage.store.changes.NEU);
    };
    transaction.onerror = function(e){
        counter.failedOperation();
    };
    //kreda.storage.store.changes('sitzplan_platz', )
};
/**
 * Speichert die Position eines Schülers im Sitzplan
 * @static
 * @param sitzplatz_id {number}
 * @param sitzplan_klasse {number}
 * @param schueler {number}
 * @param counter {QDBCounter}
 */
kreda.storage.store.sitzplan_platz.save = function(sitzplatz_id, sitzplan_klasse, schueler, counter){
    sitzplatz_id = parseInt(sitzplatz_id);
    sitzplan_klasse = parseInt(sitzplan_klasse);
    schueler = parseInt(schueler);
    var update = false;
    var handler = kreda.storage.idb.transaction('sitzplan_platz', 'readwrite').objectStore('sitzplan_platz').openCursor();
    counter.add();
    handler.onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor){
            if(cursor.value.sitzplan_klasse == sitzplan_klasse && cursor.value.sitzplatz_id == sitzplatz_id){
                cursor.value.schueler = schueler;
                cursor.update(cursor.value);
                update = true;
                counter.finishedOperation();
            }
            else
                cursor.continue();
        }
        else {
            // Es gab noch keinen entsprechenden Datensatz, der hätte angepasst werden können
            kreda.storage.store.sitzplan_platz.add(sitzplan_klasse, sitzplatz_id, schueler, counter);
            counter.finishedOperation();
        }
    };
};
/* deprecated
 * Löscht eine Reihe von Einträgen
 * @param sitzplan_klasse {number}
 * @param sids {Array.<number>}
 * @param [counter] {QDBCounter}
 * @static
 *
kreda.storage.store.sitzplan_platz.removeRange = function(sitzplan_klasse, sids, counter) {
    var handler = kreda.storage.idb.transaction('sitzplan_platz', 'readwrite').objectStore('sitzplan_platz').openCursor();
    counter = (typeof counter === "undefined") ? new QDBCounter() : counter;
    counter.add();
    handler.onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor){
            if(cursor.value.sitzplan_klasse == sitzplan_klasse) {
                for(var i in sids)
                    if(cursor.value.schueler == sids[i]){
                        kreda.storage.store.changes.saveQuiet('sitzplan_platz', cursor.value.id, kreda.storage.store.changes.DELETED);
                        cursor.delete(cursor.value);

                    }
                cursor.continue();
            }
        }
        else {
            counter.finishedOperation();
        }
    };
};*/
//**************************************************************************************
// kreda.storage.store.klasse
//**************************************************************************************
kreda.storage.store.klasse.insertQuiet = function(id, einschuljahr, endung, schule, schulart, fehlzeiten_erledigt_bis) {
    kreda.storage.insert('klasse', {id: id, einschuljahr: einschuljahr, endung: endung, schule: schule, schulart: schulart, fehlzeiten_erledigt_bis: fehlzeiten_erledigt_bis});
};
//**************************************************************************************
// kreda.storage.store.fachklasse
//**************************************************************************************
kreda.storage.store.fachklasse.insertQuiet = function(id, klasse, fach, farbe, name, bewertungstabelle, sitzplan_klasse, schueler) {
    kreda.storage.insert('fachklasse', {id: id, klasse: klasse, fach: fach, farbe: farbe, name: name, bewertungstabelle: bewertungstabelle, sitzplan_klasse: sitzplan_klasse, schueler: schueler})
};
//**************************************************************************************
// kreda.storage.store.abschnittsplanung
//**************************************************************************************
kreda.storage.store.abschnittsplanung.insertQuiet = function(id, abschnitt, plan, minuten, position, bemerkung){
    kreda.storage.insert("abschnittsplanung", {id: id, abschnitt: abschnitt, plan: plan, minuten: minuten, position: position, bemerkung: bemerkung}, id);
};
//**************************************************************************************
// kreda.storage.store.abschnitt
//**************************************************************************************
kreda.storage.store.abschnitt.insertQuiet = function(id, value, nachbereitung, minuten, hefter) {
    kreda.storage.insert('abschnitt', {id: id, value: value, nachbereitung: nachbereitung, minuten: minuten, hefter: hefter}, id);
};
//**************************************************************************************
// kreda.storage.store.plan
//**************************************************************************************
kreda.storage.store.plan.insertQuiet = function(id, datum, schuljahr, fachklasse, nachbereitung, zusatzziele, gedruckt, material_da, ausfallgrund, notizen, vorbereitet, bemerkung, ustd, alternativtitel, struktur, ueberschriftsbeginn, ohne_pause, abschnittsplaene){
    kreda.storage.insert('plan', {id: id, datum: datum, schuljahr: schuljahr, fachklasse: fachklasse, nachbereitung: nachbereitung, zusatzziele: zusatzziele, gedruckt: gedruckt, material_da: material_da, ausfallgrund: ausfallgrund, notizen: notizen, vorbereitet: vorbereitet, bemerkung: bemerkung, ustd: ustd, alternativtitel: alternativtitel, struktur: struktur, ueberschriftsbeginn: ueberschriftsbeginn, ohne_pause: ohne_pause, abschnittsplaene: abschnittsplaene}, id)
};
//**************************************************************************************
// kreda.storage.store.hausaufgabe
//**************************************************************************************
kreda.storage.store.hausaufgabe.insertQuiet = function(id, ziel, bemerkung, abgabedatum, kontrolliert, plan, mitzaehlen){
    kreda.storage.insert('hausaufgabe', {id: id, ziel: ziel, bemerkung: bemerkung, abgabedatum: abgabedatum, kontrolliert: kontrolliert, plan: plan, mitzaehlen: mitzaehlen}, id);
};
//**************************************************************************************
// kreda.storage.store.hausaufgabe_vergessen
//**************************************************************************************
kreda.storage.store.hausaufgabe_vergessen.insertQuiet = function(hausaufgabe, schueler, anzahl, bemerkung, erledigt){
    kreda.storage.insert('hausaufgabe_vergessen', {hausaufgabe: hausaufgabe, schueler: schueler, anzahl: anzahl, bemerkung: bemerkung, erledigt: erledigt});
};
//**************************************************************************************
// kreda.storage.store.pictures
//**************************************************************************************
kreda.storage.store.pictures.insertQuiet = function(id, image, imgtype){
    kreda.storage.insert('pictures', {id: id, image: image, imgtype: imgtype}, id);
};
kreda.storage.store.pictures.initializeImage = function(domObj){
    var id = $(domObj).attr("src");
    if(id != ""){
        var transaction = kreda.storage.idb.transaction('pictures', 'readonly').objectStore("pictures").get(id);
        transaction.onsuccess = function () {
            if(transaction.result){
                transaction.result.imgtype = (transaction.result.imgtype == null) ? "undefined" : transaction.result.imgtype;
                // var imgURL = canvas.toDataURL(transaction.result.image);
                //domObj.attr("src", transaction.result.image);
                var src = "data:image/" + transaction.result.imgtype + ";base64," + transaction.result.image;
                domObj.src = "data:image/" + transaction.result.imgtype + ";base64," + transaction.result.image;
            }
        };
    }
};
//**************************************************************************************
// kreda.storage.store.schueler_fehlt
//**************************************************************************************
/**
 * @param {number} id
 * @param {number} schueler Schueler ID
 * @param {number} stunde   Plan ID
 * @param {boolean} entschuldigt
 * @param {QDBCounter} [counter]
 */
kreda.storage.store.schueler_fehlt.insertQuiet = function(id, schueler, stunde, entschuldigt, counter){
    kreda.storage.insert("schueler_fehlt", {id: id, schueler: schueler, stunde: stunde, entschuldigt: entschuldigt}, null, counter)
};
/**
 *
 * @param {number} schueler Schueler ID
 * @param {number} stunde   Plan ID
 * @param {boolean} entschuldigt
 * @param {QDBCounter} [counter]
 */
kreda.storage.store.schueler_fehlt.add = function(schueler, stunde, entschuldigt, counter){
    counter = (typeof counter === "undefined") ? new QDBCounter() : counter;
    var transaction = kreda.storage.idb.transaction('schueler_fehlt', 'readwrite').objectStore("schueler_fehlt").add({schueler: schueler, stunde: stunde, entschuldigt: entschuldigt});
    counter.add();
    transaction.onsuccess = function(e) {
        counter.finishedOperation();
        kreda.storage.store.changes.saveQuiet('schueler_fehlt', e.target.result, kreda.storage.store.changes.NEU);
    };
    transaction.onerror = function(e){
        counter.failedOperation();
    };
};