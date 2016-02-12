(function() {

  var bad_words_contains = [
    "anal", "ass", "anorexia",
    "bang", "bighead", "bitch", "blow", "bomb", "boner", "boob", "breast", "bush", "butt",
    "chink", "chode", "cleavage", "clit", "cock", "crack", "cumshot", "cunt",
    "dead", "dildo", "dirty", "dumb", "dyke",
    "fag", "fake", "fap", "fat", "fetish", "freak", "fuck",
    "gay", "gun",
    "hardcore", "hates", "hoe", "hole",
    "kik", "kill", "knockers",
    "jew", "jizz", "joog", "jugs",
    "lingerie",
    "milf", "mouth", "murder",
    "naked", "nigga", "nigger", "nipple", "nsfw", "nude", 
    "oral", "orgasm",
	"penis", "petite", "piercing", "pimp", "poon", "poop", "porn", "prostitute", "pussy",
    "rack", "rape", "readyfor",
    "sale", "sex", "scum", "shit", "shoot", "shower", "skinny", "slayer", "slyaer", "sloot", "slut",  "spank", "strip", "suck",
    "testicle", "thot", "threat",
    "ugly", "underwear",
    "vagina", "virgin",
    "wank", "worse", "worst", "weed", "wholetthemonkey", "whore",
    "xx",
      
      "wtf", "straightout", "notbae", "shortbut", "10in", "mean", "hoz", "whenshe", "whenhe", "coke", "sloth", "fags", "niggers", "wronghole", "3some", "goat", "bust", "ginger", "bitchface", "pedophile", "daddyis", "mommyis", "th0tties", "stickitin", "feedme", "small", "f*ck", "sexy", "booty", "crackhead", "nophotoshop", "ak47", "vcard", "stank", "pu$$y", "monkey", "blackd", "wronghole", "jews", "black", "chink", "smallpenis", "acornhead", "p.u.s.s.y", "2time", "cheater", "stroke", "jerk", "jerkoff", "bust", "bustanut", "onmyface", "crossdresser", "sloth", "bnor", "illegal", "jewcurls", "whenthe", "kush", "whenhe", "whenshe", "dontlike", "bootypics", "sendsthose", "nasty", "turnt", "8=", "=d", "Ś", "ü", "ç", "somed", "thed" ];        
    
  var bad_words_exact = [
    "balls", "bra",
    "cum", "damn","dick", "daddylove", "deepthroat",
    "nip", "nips", "nut", "hardnips",
	"sloot", "tit", "tits",
    "vag", "virg",
    "wet", "whitegirl",
	"."];
    
  var bad_users_exact = [
    "ei38TAFKG9", "6Jy7ifUrwm"];    
    
    
  module.exports = {

    version: '1.0.0',
      
    hasBadWord: function(badWord) {
        badWord = badWord.toLowerCase();
        for (var i = 0; i < bad_words_contains.length; i++) {
            if(badWord.indexOf(bad_words_contains[i]) > -1){
                return true;
            }
        }
        if(bad_words_exact.indexOf(badWord) > -1){
            return true;
        }
        return false;
    },
      
    hasBadUser: function(user) {
        if(bad_users_exact.indexOf(user) > -1){
            return true;
        }
        return false;
    }  
      
  }
}());