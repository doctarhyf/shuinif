import React, { useEffect, useRef, useState } from "react";
import CardWorkingTeam from "../comps/CardWorkingTeam";
import { ContactView } from "../comps/ContactView";
import FormAddNewAgent from "../comps/FormAddNewAgent";
import * as SB from "../db/sb";
import add_user from "../assets/icons/add_user.png";
import {
  GetTeamWorkingOnDayAndTime,
  LoadRoulementAndSchedMatrix,
  ParseSchedMatrixFromSched,
} from "../helpers/Shifts";
import { DUMMY_WORDS, TABLE_NAMES } from "../helpers/flow";
import {
  GetDateParts,
  GetRandomHexColor,
  GetRandomTailwindClasses,
} from "../helpers/funcs";
import list from "../assets/icons/list.png";
import IconButton from "../comps/IconButton";

import WordForm from "../comps/WordForm";
import LoadingScreen from "../comps/LoadingScreen";

const SECTIONS = {
  WORDS_LIST: "Words List",
  NEW_WORD: "New Word",
};

const clBtn = `p-2 mx-2 border border-transparent hover:border hover:border-sky-500 
rounded-t-lg text-sky-500`;

const words_per_page = 5;
let pages_count = 0;

export default function Dict({ toggleLoadingView }) {
  const [words, setwords] = useState([]);
  const [wordsf, setwordsf] = useState([]);
  const [q, setq] = useState("");
  const [selectedSection, setSelectedSection] = useState(SECTIONS.WORDS_LIST);
  const [selectedWord, setSelectedWord] = useState(DUMMY_WORDS()[0]);
  const [updatingSelectedWord, setUpdatingSelectedWord] = useState(false);
  const [currentPage, setcurrentPage] = useState(0);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    setloading(true);
    const words = await SB.SBLoadItems(TABLE_NAMES.WORDS); // DUMMY_WORDS();

    parsePagesCount(words);

    setwords(words);
    setwordsf(words);
    setloading(false);
  }

  function parsePagesCount(data) {
    const words_count = data.length;
    pages_count = words_count / words_per_page;
  }

  function onSearchWord(search) {
    setloading(true);
    const lwsearch = search.toLowerCase();
    setq(search);
    if (search.trim() === "") {
      setq("");
      setwordsf(words);
      setloading(false);
      return;
    }

    let foundWords = words.filter((it, i) => {
      const { zh, py, def, label } = it;

      const fzh = zh && zh.includes(search);
      const fpy = py && py.toLowerCase().includes(lwsearch);
      const fdef = def && def.toLowerCase().includes(lwsearch);
      const flabel = label && label.toLowerCase().includes(lwsearch);

      setloading(false);
      return fzh || fpy || fdef || flabel;
    });
    setwordsf(foundWords);
    setloading(false);
  }

  return (
    <div>
      <div>
        {Object.entries(SECTIONS).map((section, i) => (
          <button
            key={i}
            className={`btn ${
              section[1] === selectedSection ? "btn-success text-white" : ``
            } `}
            onClick={(e) => setSelectedSection(section[1])}
          >
            {section[1]}
          </button>
        ))}
      </div>

      {selectedSection === SECTIONS.WORDS_LIST && (
        <div>
          <div className="flex gap-4">
            <div className=" min-w-[120pt] border-r px-2 ">
              <div>
                <input
                  className="border my-2 px-1 rounded-md hover:border-purple-500 outline-none focus:border-purple-500"
                  placeholder="search"
                  type="text"
                  value={q}
                  onChange={(e) => onSearchWord(e.target.value)}
                />
              </div>

              <div>
                {wordsf.map((word, i) => (
                  <div>
                    <button
                      onClick={(e) => {
                        setUpdatingSelectedWord(false);
                        setSelectedWord(word);
                      }}
                      className={`hover:bg-sky-500 hover:text-white px-2 py-1 w-full rounded-md ${
                        selectedWord.id === word.id && "bg-sky-500 text-white"
                      } `}
                    >
                      {word.zh}
                    </button>
                  </div>
                ))}
                <LoadingScreen loading={loading} />
              </div>

              <div className="join border border-success">
                <button className="join-item btn">1</button>
                <button className="join-item btn btn-success">2</button>
                <button className="join-item btn">3</button>
                <button className="join-item btn">4</button>
              </div>
            </div>

            <WordForm
              onRequestReload={loadWords}
              updatingSelectedWord={updatingSelectedWord}
              setUpdatingSelectedWord={setUpdatingSelectedWord}
              word={selectedWord}
            />
          </div>
        </div>
      )}

      {selectedSection === SECTIONS.NEW_WORD && (
        <div>
          <WordForm isNewWord onRequestReload={loadWords} />
          <button
            onClick={(e) => setSelectedSection(SECTIONS.WORDS_LIST)}
            className="btn btn-sm btn-error"
          >
            Words List
          </button>
        </div>
      )}
    </div>
  );
}
