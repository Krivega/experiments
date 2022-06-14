<h2 align="center">Vinteo FRONTEND</h2>

<h3>Builds</h3>

| Client                                             | Action                                                    | Result                                                      |
| -------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| [![][title_web_bage]][build-action_web_link]       | [![][build-action_web_bage]][build-action_web_link]       | [![][build-result_web_bage]][build-result_web_link]         |
| [![][title_desk_bage]][build-action_desktop_link]  | [![][build-action_desk_bage]][build-action_desktop_link]  | [![][build-result_desktop_bage]][build-result_desktop_link] |
| [![][title_screen_bage]][build-action_screen_link] | [![][build-action_screen_bage]][build-action_screen_link] | [![][build-result_screen_bage]][build-result_screen_link]   |
| [![][title_all_bage]][build-action_all_link]       | [![][build-action_all_bage]][build-action_all_link]       | [![][build-result_all_bage]][build-result_all_link]         |

<h3>Integration tests</h3>

| Client                                            | Action                                                  | Result                                                    |
| ------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| [![][title_web_bage]][test-action_web_link]       | [![][test-action_web_bage]][test-action_web_link]       | [![][test-result_web_bage]][test-result_web_link]         |
| [![][title_desk_bage]][test-action_desktop_link]  | [![][test-action_desk_bage]][test-action_desktop_link]  | [![][test-result_desktop_bage]][test-result_desktop_link] |
| [![][title_screen_bage]][test-action_screen_link] | [![][test-action_screen_bage]][test-action_screen_link] | [![][test-result_screen_bage]][test-result_screen_link]   |
| [![][title_all_bage]][test-action_all_link]       | [![][test-action_all_bage]][test-action_all_link]       | [![][test-result_all_bage]][test-result_all_link]         |

<h3>Artifacts</h3>

| Target                                            | Action                                          | Result                                                |
| ------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| [![][tests-title_bage]][tests-run_link]           | [![][tests-run_bage]][tests-run_link]           | [![][tests-result_bage]][tests-result_link]           |
| [![][stylefuide-title_bage]][stylefuide-run_link] | [![][stylefuide-run_bage]][stylefuide-run_link] | [![][stylefuide-result_bage]][stylefuide-result_link] |

[title_web_bage]: https://img.shields.io/badge/WEB-01579B.svg?style=for-the-badge
[title_desk_bage]: https://img.shields.io/badge/DESKTOP-BF360C.svg?style=for-the-badge
[title_screen_bage]: https://img.shields.io/badge/SCREENCAST-1B5E20.svg?style=for-the-badge
[title_all_bage]: https://img.shields.io/badge/ALL-4E342E.svg?style=for-the-badge
[build-action_web_bage]: https://img.shields.io/badge/RUN-6750A4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[build-action_web_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_BUILD]=web-client&var[CI_PREFIX_WEB_CLIENT]=next-
[build-result_web_bage]: https://img.shields.io/badge/builds-625B71.svg?style=for-the-badge&logo=databricks&logoColor=fff
[build-result_web_link]: http://backend.vinteo.com/?url=web-client

[build-action_desk_bage]: https://img.shields.io/badge/RUN-6750A4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[build-action_desktop_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_BUILD]=desktop-client&var[CI_DESKTOP_CLIENT_SUB_PUBLIC_DIR]=next
[build-result_desktop_bage]: https://img.shields.io/badge/builds-625B71.svg?style=for-the-badge&logo=databricks&logoColor=fff
[build-result_desktop_link]: https://frontend.vinteo.com/desktop-client/next/

[build-action_screen_bage]: https://img.shields.io/badge/RUN-6750A4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[build-action_screen_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_BUILD]=screencast&var[CI_SCREENCAST_SUB_PUBLIC_DIR]=next
[build-result_screen_bage]: https://img.shields.io/badge/builds-625B71.svg?style=for-the-badge&logo=databricks&logoColor=fff
[build-result_screen_link]: https://frontend.vinteo.com/screencast/next/

[build-action_all_bage]: https://img.shields.io/badge/RUN-6750A4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[build-action_all_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_BUILD]=web-client,desktop-client,screencast&var[CI_DESKTOP_CLIENT_SUB_PUBLIC_DIR]=next&var[CI_SCREENCAST_SUB_PUBLIC_DIR]=next&var[CI_PREFIX_WEB_CLIENT]=next-
[build-result_all_bage]: https://img.shields.io/badge/builds-625B71.svg?style=for-the-badge&logo=databricks&logoColor=fff
[build-result_all_link]: https://frontend.vinteo.com/

[test-action_web_bage]: https://img.shields.io/badge/RUN-a4508e.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[test-action_web_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_CY]=web-client&var[CYPRESS_TEST_FILES]=**/*.*&var[CI_RUN_CY_DESKTOP_NO_PARALLEL]=1
[test-result_web_bage]: https://img.shields.io/badge/DASHBOARD-a46650.svg?style=for-the-badge&logo=Cypress&logoColor=fff
[test-result_web_link]: http://10.23.8.97:8080/web-next/runs

[test-action_desk_bage]: https://img.shields.io/badge/RUN-a4508e.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[test-action_desktop_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_CY]=desktop-client&var[CYPRESS_TEST_FILES]=**/*.*&var[CI_RUN_CY_DESKTOP_NO_PARALLEL]=1
[test-result_desktop_bage]: https://img.shields.io/badge/DASHBOARD-a46650.svg?style=for-the-badge&logo=Cypress&logoColor=fff
[test-result_desktop_link]: http://10.23.8.97:8080/desktop-next/runs

[test-action_screen_bage]: https://img.shields.io/badge/RUN-a4508e.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[test-action_screen_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_CY]=screencast&var[CYPRESS_TEST_FILES]=**/*.*&var[CI_RUN_CY_DESKTOP_NO_PARALLEL]=1
[test-result_screen_bage]: https://img.shields.io/badge/DASHBOARD-a46650.svg?style=for-the-badge&logo=Cypress&logoColor=fff
[test-result_screen_link]: http://10.23.8.97:8080/screencast-next/runs

[test-action_all_bage]: https://img.shields.io/badge/RUN-a4508e.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff

[test-action_all_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_CY]=web-client,desktop-client,screencast&var[CYPRESS_TEST_FILES]=**/*.*&var[CI_RUN_CY_DESKTOP_NO_PARALLEL]=1
[test-result_all_bage]: https://img.shields.io/badge/DASHBOARD-a46650.svg?style=for-the-badge&logo=Cypress&logoColor=fff
[test-result_all_link]: http://10.23.8.97:8080

[tests-title_bage]: https://img.shields.io/badge/unit_tests-397624.svg?style=for-the-badge
[tests-run_bage]: https://img.shields.io/badge/run-5064a4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff
[tests-result_bage]: https://img.shields.io/badge/Coverage_report-9050a4.svg?style=for-the-badge&logo=jest&logoColor=fff
[tests-run_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next
[tests-result_link]: https://krivega.git.vinteo.com/vinteo.frontend/next/
[stylefuide-title_bage]: https://img.shields.io/badge/ui-a46650.svg?style=for-the-badge
[stylefuide-run_bage]: https://img.shields.io/badge/run-5064a4.svg?style=for-the-badge&logo=apacherocketmq&logoColor=fff
[stylefuide-result_bage]: https://img.shields.io/badge/styleguide-9050a4.svg?style=for-the-badge&logo=mui&logoColor=fff

[stylefuide-run_link]: https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_STYLE_GUIDE]=1
[stylefuide-result_link]: https://frontend.vinteo.com/styleguide/next/

<h4 align="center">Other runners</h4>

[![create_patch-web_client](https://img.shields.io/badge/create_patch-web_client-e54304.svg?style=for-the-badge)](http://backend.vinteo.com/?url=web-client)
[![run-skip_build](https://img.shields.io/badge/run-skip_build-darkblue.svg?style=for-the-badge)](https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_SKIP]=build-apps)
[![run-dev_builds](https://img.shields.io/badge/run-dev_builds-303030.svg?style=for-the-badge)](https://git.vinteo.com/krivega/vinteo.frontend/-/pipelines/new?ref=next&var[CI_RUN_BUILD]=desktop-client,web-client&var[CI_DESKTOP_CLIENT_SUB_PUBLIC_DIR]=dev&var[REACT_APP_DEBUG]=true&var[CI_PREFIX_WEB_CLIENT]=dev)
