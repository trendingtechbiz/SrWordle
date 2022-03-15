function Constraints() {

  var posConstraints = 
    [...Array(5).keys()]
    .map( i => {return {
        notHere: [],
        confirmed: null
      }});

  var constraints = {
    posConstraints: posConstraints,
    possible: [],
    notMatch: []
  };
  this.hints = [];

  function pushUnique(arr,el){
    if(!arr.includes(el)){
      arr.push(el);
    }
    return arr;
  }

  var getRegex = function(){
    var r = constraints.posConstraints.map((pc)=> pc.confirmed?pc.confirmed:`[^${pc.notHere.concat(constraints.notMatch).join('')}]`).join('');
    return new RegExp(r);
  }

  function wordValue(w, usedLetters){
    var wArr=w.split('').reduce((ac,el) => pushUnique(ac,el) ,[]);
    return wArr.reduce((ac,l)=> ac+=usedLetters.includes(l)?0:LETTER_FREQ[l],0);
  }

  function count(arr,el){
    return arr.reduce((ac,l) => ac+=(l==el)?1:0,0);
  }

  this.getUsedLetters = function(){
    var usedWords = this.hints.map(h => h.replaceAll(/[^a-zñ]+/ig,'').toLowerCase());
    console.log(usedWords);
    var usedLetters = usedWords
      .reduce((ac,w)=>{
        w.split('').forEach((c)=>pushUnique(ac,c));
        return ac;
      },[]);
    console.log(usedLetters);
    return usedLetters;
  }

  this.getInformative = function(){
    var usedLetters = this.getUsedLetters();
    var filter = (dict) => dict.sort((a,b)=>wordValue(b,usedLetters)-wordValue(a,usedLetters));
    
    var result=filter(DICT);
    return result;
  }

  this.getCandidates = function(dict = DICT){
    var reg = getRegex();
    console.log(reg);

    var usedLetters = this.getUsedLetters();
    var filter = (dict) => dict.filter(w => w.match(reg) && constraints.possible.every(p => w.includes(p)))
      .sort((a,b)=>wordValue(b,usedLetters)-wordValue(a,usedLetters));
    
    var result = filter(dict);
    
    return result;
  }

  var hintRegex = /^\s*(!?[a-zñ])\s*(!?[a-zñ])\s*(!?[a-zñ])\s*(!?[a-zñ])\s*(!?[a-zñ])\s*$/i;

  var splitHint = function(hint){
    var m = hint.match(hintRegex);
    if(!m) return null;
    return m.slice(1);
  }

  this.addHint = function(hint) {
    var letters = splitHint(hint);
    if(!letters) return;
    this.hints.push(hint);

    letters.forEach(
      (l,i) =>{
        var c = constraints;
        var posConstraint = c.posConstraints[i];
        if(l[0]=="!"){
          pushUnique(constraints.notMatch,l[1].toLowerCase())
        }else if(l[0]==l[0].toUpperCase()){
          posConstraint.confirmed = l[0].toLowerCase();
        }else{
          pushUnique(posConstraint.notHere,l[0].toLowerCase())
          pushUnique(constraints.possible,l[0].toLowerCase())
        }
      }
    ,this);
    return this;
  };

  function getHintPic(hint){
    var letters = splitHint(hint);
    return letters.map((l) => l[0]=="!"?`${l[1]}⬛` : l[0]!=l[0].toUpperCase() ? `${l[0]}🟨` : `${l[0]}🟩`).join("").toUpperCase();
  }

  this.getGamePic = function(){
    return this.hints.map(h => getHintPic(h)).join("\n");
  }

}
