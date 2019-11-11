import React from 'react';
import CookieConsent from 'react-cookie-consent';

function CookieBar() {
  const userLang = navigator.language || navigator.userLanguage;
  // console.log(userLang); use this line for logging diffrent language codes for porting purposes.

  let buttonText;
  let declineButtonText;
  let cookieDescription;
  let cookiePolicy;

  if (userLang === 'sv') {
    buttonText = 'Godkänn';
    declineButtonText = 'Avvisa';
    cookieDescription = 'Vi använder cookies för att kunna ge dig en bättre upplevelse. Genom att du fortsätter att använda Varaamo så accepterar du användingen av cookies.';
    cookiePolicy = (
      <div className="cookiePolicy">
        {' '}
        <a href="https://varaamo.turku.fi:8007/cookieInformation-sv.html" style={{ color: 'white' }}>Länk till Cookie Policy</a>
        {' '}
      </div>
    );
  } else {
    buttonText = 'Hyväksyn';
    declineButtonText = 'Hylkää';
    cookieDescription = 'Käytämme evästeitä parantaaksemme käyttökokemustasi. Jatkamalla Varaamon käyttöä hyväksyt evästeiden käytön.';
    cookiePolicy = (
      <div className="cookiePolicy">
        {' '}
        <a href="https://varaamo.turku.fi:8007/cookieInformation-fi.html" style={{ color: 'white' }}>Linkki Evästekäytäntöön</a>
        {' '}
      </div>
    );
  }
  return (
    <CookieConsent
      buttonClasses="cookie-accept-button"
      buttonId="cookie-accept-button"
      buttonText={buttonText}
      contentStyle={{ flex: 'auto' }}
      declineButtonClasses="cookie-decline-button"
      declineButtonId="cookie-decline-button"
      declineButtonText={declineButtonText}
      disableButtonStyles
      enableDeclineButton
      onDecline={() => { window.location.replace('http://www.turku.fi'); }}
      setDeclineCookie={false}
    >
      {cookieDescription}
      {' '}
      {cookiePolicy}
    </CookieConsent>
  );
}

export default CookieBar;
