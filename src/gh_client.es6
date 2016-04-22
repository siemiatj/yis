// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import github from 'github';

console.log('GITHUB: ', github);

// export class YisGH {

// }
let githubApi = new github({ version: "3.0.0", });
githubApi.pullRequests.getAll({ user: 'saucelabs', repo: 'yis'}, function(err, data) {
  if (err) { throw err };
  console.log("data:", data);
})