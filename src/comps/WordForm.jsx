import React, { useEffect, useRef, useState } from "react";
import { DUMMY_WORDS, TABLE_NAMES } from "../helpers/flow";
import del from "../assets/icons/del.png";
import { __ } from "../helpers/funcs";
import { SBInsertItem, SBRemoveItem, SBUpdateItemWithID } from "../db/sb";
import LoadingScreen from "./LoadingScreen";

function WordForm({
  word,
  updatingSelectedWord,
  setUpdatingSelectedWord,
  isNewWord,
  onRequestReload,
}) {
  word = word === undefined ? DUMMY_WORDS()[0] : word;

  let ref_zh = useRef();
  let ref_py = useRef();
  let ref_def = useRef();
  let ref_label = useRef();
  let ref_tags = useRef();

  const [loading, setloading] = useState(false);

  function onUpdateWord() {
    setloading(true);
    const data = {
      id: word.id,
      py: _(ref_py),
      def: _(ref_def),
      label: _(ref_label),
      tags: _(ref_tags),
    };

    SBUpdateItemWithID(
      data,
      TABLE_NAMES.WORDS,
      (res) => {
        console.log(res);
        setloading(false);
        onRequestReload();
      },
      (err) => {
        console.log(err);
        setloading(false);
      }
    );
    console.log("Updating data ...\n", JSON.stringify(data));
  }

  function onRemoveWord() {
    if (!confirm("Are you sure you wanna delete this word?")) {
      return;
    }

    setloading(true);
    SBRemoveItem(
      word,
      TABLE_NAMES.WORDS,
      "id",
      (res) => {
        console.log(res);
        setloading(false);
        onRequestReload();
      },
      (e) => {
        console.log(e);
        setloading(false);
      }
    );

    console.log(arguments);
  }

  function onSaveNewWord() {
    setloading(true);
    const zh = _(ref_zh);
    const py = _(ref_py);
    const def = _(ref_def);
    const label = _(ref_label);
    const tags = _(ref_tags);

    const data = {
      zh: zh,
      py: py,
      def: def,
      label: label,
      tags: tags,
    };

    console.log(data);

    if (!(__(zh) && __(py) && __(def) && __(label) && __(tags))) {
      const msg = "All values must be provided!";
      console.warn(msg);
      alert(msg);
      setloading(false);
      return;
    }

    SBInsertItem(
      data,
      TABLE_NAMES.WORDS,
      (res) => {
        console.log(res);
        setloading(false);
        onRequestReload();
      },
      (err) => {
        console.log(err);
        setloading(false);
      }
    );
  }

  const _ = (ref) => {
    console.log(ref.current);
    return ref.current.value;
  };

  return (
    <div>
      <table>
        <thead>
          <th className="text-3xl" colSpan={2}>
            {!updatingSelectedWord && !isNewWord && word.zh}

            {(updatingSelectedWord || isNewWord) && (
              <input
                ref={ref_zh}
                className="outline-none border rounded-md hover:border-purple-500 focus:border-purple-500 p-1"
                type="text"
                defaultValue={word.zh}
              />
            )}
          </th>
        </thead>
        <tbody>
          {[
            ["Pinyin", word.py, ref_py],
            ["Defition", word.def, ref_def],
            ["Label", word.label, ref_label],
            ["Tags", word.tags, ref_tags],
          ].map((data, i) => (
            <tr key={i}>
              <td align="right" valign="top" className="text-gray-400 text-sm ">
                {data[0]}
              </td>
              <td>
                {!updatingSelectedWord &&
                  !isNewWord &&
                  data[0] !== "Tags" &&
                  data[1]}
                {(updatingSelectedWord || isNewWord) && data[0] !== "Tags" && (
                  <input
                    ref={data[2]}
                    className="mx-1 border border-sky-200 px-1 rounded-md hover:border-sky-500 focus:border-sky-500 outline-none"
                    type="text"
                    defaultValue={data[1]}
                  />
                )}

                {!updatingSelectedWord &&
                  !isNewWord &&
                  data[0] === "Tags" &&
                  data[1] &&
                  data[1].split &&
                  data[1].split(";").map((lb, i) => (
                    <span
                      key={i}
                      className={` cursor-pointer hover:bg-red-500 hover:text-white border-red-400  mx-1 rounded-full border   px-2 text-xs uppercase py-1  `}
                    >
                      {lb}
                    </span>
                  ))}

                {(updatingSelectedWord || isNewWord) && data[0] === "Tags" && (
                  <div>
                    <div>
                      <div>
                        <input
                          className="mx-1 border border-sky-200 px-1 rounded-md hover:border-sky-500 focus:border-sky-500 outline-none"
                          type="text"
                          placeholder="Add new tag ..."
                          ref={ref_tags}
                          defaultValue={word.tags}
                        />
                      </div>

                      {/* <button
                        className="btn btn-xs btn-success"
                        onClick={(e) => onSaveNewTag()}
                      >
                        Save New Tag
                      </button> */}
                    </div>
                    <div className=" text-sm py-2 italic">
                      Separate all tags with <span className="kbd">";"</span>{" "}
                      character
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}

          <tr>
            {!isNewWord && (
              <td align="center" colSpan={2}>
                {!updatingSelectedWord && !isNewWord && (
                  <button
                    onClick={(e) => setUpdatingSelectedWord(true)}
                    className="btn btn-sm"
                  >
                    UPDATE
                  </button>
                )}
                {(updatingSelectedWord || isNewWord) && (
                  <button
                    onClick={(e) => onUpdateWord()}
                    className="btn btn-sm"
                  >
                    SAVE
                  </button>
                )}
                {(updatingSelectedWord || isNewWord) && (
                  <button
                    onClick={(e) => setUpdatingSelectedWord(false)}
                    className="btn btn-sm"
                  >
                    CANCEL
                  </button>
                )}
                {!updatingSelectedWord && !isNewWord && (
                  <button
                    onClick={(e) => onRemoveWord()}
                    className="btn btn-sm"
                  >
                    REMOVE
                  </button>
                )}
              </td>
            )}

            {isNewWord && (
              <td align="center" colSpan={2}>
                <button
                  onClick={(e) => onSaveNewWord()}
                  className="btn btn-sm btn-success"
                >
                  Save New Word
                </button>
              </td>
            )}
          </tr>
        </tbody>
      </table>
      <LoadingScreen loading={loading} />
    </div>
  );
}

export default WordForm;
