(function (win) {

  /*
  Hussle and learn:
  Je ziet de hele lijst
  Je kiest wat je wil zien: source of destination
  Per item in lijst klik je dan 1 keer om de niet zichtbare item te tonen
  en nog een keer klikken om weer weg te laten
  Boven in zit een knop: hussle - hiermee wordt de lijst opnieuw random gesorteerd
  Dus makkelijk oefenen zonder puntentelling e.d.
  */

  win.HussleScreen = React.createClass({
    displayName: "HussleScreen",

    getInitialState: function () {
      console.log(this.props.entries);
      return {};
    },
    onBack: function () {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type: "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    render: function () {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "toolbar topToolbar" },
          React.createElement(
            "button",
            { onClick: this.props.onMain },
            "Back"
          )
        ),
        React.createElement(
          "h2",
          null,
          "Hussle"
        )
      );
    }
  });
})(window);