const Auth = (() => {
  const SESSION_KEY = 'taller_session';
  return {
    isLoggedIn(){
      if(!DB.settings.requirePassword) return true;
      return sessionStorage.getItem(SESSION_KEY) === '1';
    },
    async login(password){
      if(!DB.settings.requirePassword) { sessionStorage.setItem(SESSION_KEY,'1'); return true; }
      const hash = await DB.sha256(password||'');
      if(!DB.settings.passwordHash){
        DB.updateSettings({ passwordHash: hash });
        sessionStorage.setItem(SESSION_KEY,'1');
        return true;
      }
      if(hash === DB.settings.passwordHash){
        sessionStorage.setItem(SESSION_KEY,'1');
        return true;
      }
      return false;
    },
    logout(){ sessionStorage.removeItem(SESSION_KEY); },
    async setPassword(newPass){
      const hash = await DB.sha256(newPass);
      DB.updateSettings({ passwordHash: hash });
    },
    getQuestions(){ return (DB.settings.securityQuestions||[]).map(x=>x.q); },
    async verifyAnswers(answers){
      const qs = DB.settings.securityQuestions||[];
      if(!qs.length || answers.length !== qs.length) return false;
      for(let i=0;i<qs.length;i++){
        const h = await DB.hashAnswer(answers[i]||'');
        if(h !== qs[i].aHash) return false;
      }
      return true;
    }
  };
})();
