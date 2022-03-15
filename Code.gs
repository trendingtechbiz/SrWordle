const TOKEN = "YourTokenHere";
const TELEGRAM_URL = "https://api.telegram.org/bot" + TOKEN;
const MAX_SECONDS = 1*60*60; // 1 hour
const HELP = `
<b>Soy el Señor Wordle.\nSoluciono problemas.</b>
Introduce las jugadas que llevas con el siguiente formato:
<b>!a</b> La letra no está en la palabra.
<b>a</b> La letra está en otra posición.
<b>A</b> La letra está en esta posición.
Puedes separar con tantos espacios como quieras, y añadir varias jugadas a la vez, una por línea.

Ejemplos:
C⬛E🟩S⬛T🟨A🟩
Escribe: <b>!c E !s t A</b>
V⬛E🟩R🟩S🟨O🟩
Escribe: <b>!v   ER  s  O</b>

/status estado del juego
/next palabras candidatas
/reset borra el juego actual
`;

function doPost(e){
  var c = JSON.parse(e.postData.contents);
  var text = c.message.text.trim();
  var id = c.message.chat.id;

  var c = new Constraints();
  var hints = getHints(id);
  if(hints){
    hints.forEach(h=>c.addHint(h));
  }

  switch(text){
    case "/start":
      sendText(id,HELP);
    break;
    case "/status":
      sendText(id,c.hints.length>0?c.getGamePic():"No hay jugadas");
    break;
    case "/reset":
      removeHints(id);
      sendText(id,"Juego borrado");
    break;
    case "/next":
      nextWords(id,c);
    break;
    default:
      var lines = text.split("\n");
      var error = false;
      lines.forEach(line =>{
        var success = c.addHint(line);
        if(!success){
          sendText(id,'🤔 No he entendido: '+line)
        }
        error = error || !success;
      });
      if(error){
        sendText(id,HELP);
      }
      saveHints(id,c.hints);
      sendText(id,c.getGamePic());
      nextWords(id,c);
    break;
  }
}

function nextWords(id,c){
  var candidates = c.getCandidates();
  var infos = c.getInformative();
  var usedLetters = c.getUsedLetters();

  var res = (usedLetters.length < 10 && candidates.length > 5) ? infos.slice(0,5) : candidates.slice(0,5);

  var str = res.length>0?`<b>😎 Prueba con:</b>\n${res.join("\n")}` : `😅 Me he quedado sin ideas!`;
  sendText(id,str);
}

function sendText(to, msg){
  console.log(`${to}:\n${msg}`);
  var url = TELEGRAM_URL + "/sendMessage?chat_id=" + to + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
  UrlFetchApp.fetch(url);
}

function saveHints(id,hints){
  CacheService.getScriptCache().put(id,JSON.stringify(hints),MAX_SECONDS);
}

function removeHints(id){
  CacheService.getScriptCache().remove(id);
}

function getHints(id){
  var s =  CacheService.getScriptCache().get(id);
  return s ? JSON.parse(s) : null;
}

