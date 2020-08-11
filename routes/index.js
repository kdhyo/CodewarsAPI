var express = require("express");
var router = express.Router();
var cors = require("cors");
var Problems = require("../models/Problem");
var vm = require("vm");

/* GET home page. */
router.get("/problems", cors(), async function (req, res, next) {
  try {
    const docs = await Problems.find();
    res.json(docs);
  } catch (error) {
    //error handling
    next(error);
  }
});

/* POST */
router.options("/problems/:problem_id", cors());

router.post("/problems/:problem_id", cors(), async function (req, res, next) {
  const body = req.body;
  const code = body.code; // 사용자 풀이 내용
  try {
    const problem = await Problems.findById(req.params.problem_id);

    let isCorrect = true;
    // var compare = [];

    for (let i = 0; i < problem.tests.length; i++) {
      try {
        const script = new vm.Script(code + problem.tests[i].code);
        const result = script.runInNewContext();

        if (`${result}` !== problem.tests[i].solution) {
          isCorrect = false;
        }
      } catch (err) {
        res.json({
          result: "에러",
          detail: err.message,
        });
        return;
      }

      // compare.push(`사용자답:${result}, 정답:${problem.tests[i].solution}`);
    }
    if (!isCorrect) {
      res.json({ result: "오답" });
    } else {
      res.json({ result: "정답" });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
