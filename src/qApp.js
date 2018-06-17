/* eslint-disable camelcase,prefer-arrow-callback,no-plusplus,comma-dangle,no-trailing-spaces */
const loadCapabilityApis = async (config) => {
  try {
    const capabilityApisCSS = document.createElement('link');
    const prefix = (config.prefix !== '') ? `/${config.prefix}` : '';
    const ticket = (config.ticket !== '' && config.ticket !== undefined) ? `?qlikTicket=${config.ticket}` : '';
    capabilityApisCSS.href = `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}/resources/autogenerated/qlik-styles.css${ticket}`;
    capabilityApisCSS.type = 'text/css';
    capabilityApisCSS.rel = 'stylesheet';
    document.head.appendChild(capabilityApisCSS);
    capabilityApisCSS.loaded = new Promise((resolve) => {
      capabilityApisCSS.onload = () => { resolve(); };
    });
    const capabilityApisJS = document.createElement('script');
    capabilityApisJS.src = `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}/resources/assets/external/requirejs/require.js`;
    setTimeout(() => { document.head.appendChild(capabilityApisJS); }, 1000);
    capabilityApisJS.loaded = new Promise((resolve) => {
      capabilityApisJS.onload = () => { resolve(); };
    });
    await Promise.all([capabilityApisJS.loaded, capabilityApisCSS.loaded]);
  } catch (error) {
    throw new Error(error);
  }
};

const qApp = async (config) => {
  try {
    await loadCapabilityApis(config);
    const prefix = (config.prefix !== '') ? `/${config.prefix}/` : '/';
    window.require.config({
      baseUrl: `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}resources`,
      paths: {
        qlik: `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}resources/js/qlik`,
      },
    });
    return new Promise((resolve) => {
      window.require(['js/qlik'], (qlik) => {
        const app = qlik.openApp(config.appId, { ...config, isSecure: config.secure, prefix });
        console.log('QdtComponents Check 0 after openApp selectItemLocalStorage =', localStorage.getItem('selectItemLocalStorage'));

        app.getList('SelectionObject', function (reply) {
          let loc_selections = [];
          const init_loc_selections = [];
          let j;
          console.log('QdtComponents Check 1 selectItemLocalStorage =', localStorage.getItem('selectItemLocalStorage'));

          for (j = 0; j < reply.qSelectionObject.qSelections.length; j++) {
            loc_selections.push({
              field: reply.qSelectionObject.qSelections[j].qField,
              selected: reply.qSelectionObject.qSelections[j].qSelected
            });
          }

          const applyLocSelections = !(loc_selections === init_loc_selections &&
              (app.id !== localStorage.getItem('lastQlikAppId') || app.id !== localStorage.getItem('lastFilterAppId')));
          console.log('QdtComponents applyLocSelections=', applyLocSelections);


          if (localStorage.getItem('selectItemLocalStorage') !== JSON.stringify(loc_selections) &&
              applyLocSelections
          ) {
            console.log('QdtComponents Check 2 selectItemLocalStorage =', localStorage.getItem('selectItemLocalStorage'), ' loc_selections=', JSON.stringify(loc_selections));
            console.log('QdtComponents  app.id=', app.id, ' lastQlikAppId=', localStorage.getItem('lastQlikAppId'), 'lastFilterAppId=', localStorage.getItem('lastFilterAppId'));
            console.log(`QdtComponents loc_selections ${JSON.stringify(loc_selections)}`);
            console.log(`QdtComponents setItem selectItemLocalStorage ${JSON.stringify(loc_selections)}`);
            localStorage.setItem('selectItemLocalStorage', JSON.stringify(loc_selections));
            localStorage.setItem('lastQlikAppId', app.id);
          }
          loc_selections = [];
        });
        resolve(app);
        console.log('QdtComponents Check 3 after resolve from selectItemLocalStorage =', localStorage.getItem('selectItemLocalStorage'));
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};

export default qApp;
