import * as React from "react";
import {imageClassifier, Classifier, Prediction} from "ml5";

import "./App.css";

type Card = "espada1" | "copa2" | "oro3";
type Status = "init" | "playing" | "won" | "lost";

const cards: Card[] = ["espada1", "copa2", "oro3"];

function App() {
  const webcam = React.useRef<HTMLVideoElement>(null);
  const [classifier, setClassifier] = React.useState<null | Classifier>(null);
  const [limit, setLimit] = React.useState<number>(5000);
  const [card, setCard] = React.useState<null | Card>(null);
  const [status, setStatus] = React.useState<Status>("init");

  function handlePlay() {
    const index = Math.round(Math.random() * (cards.length - 1));
    const newCard = cards[index];

    setCard(newCard);
    setStatus("playing");

    setTimeout(() => {
      if (!classifier || !webcam.current) return;

      classifier.classify(webcam.current, (error: string, [match]: Prediction[]) => {
        if (error) {
          console.error(error);

          return;
        }

        if (match.label === newCard) {
          setStatus("won");
          alert("Ganaste");
          setLimit((limit) => Math.max(0, limit - 500));
        } else {
          setStatus("lost");
          alert(`Eso parece mas un ${match.label}`);
        }
      });
    }, limit);
  }

  React.useEffect(() => {
    const classifier = imageClassifier(
      `https://teachablemachine.withgoogle.com/models/CCmaPpRyt/model.json`,
      () => {
        navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
          if (!webcam.current) return;

          webcam.current.srcObject = stream;
          webcam.current.play();
        });
      },
    );

    setClassifier(classifier);
  }, []);

  return (
    <div className="App">
      <video ref={webcam} height="640" width="480" />
      {status === "playing" && card && <span>Encontra la carta {card}</span>}
      {["init", "won", "lost"].includes(status) && <button onClick={handlePlay}>Play</button>}
    </div>
  );
}

export default App;
