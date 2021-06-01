/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var path = require('path');

const Joi = require('@hapi/joi');

const stepSchema = Joi.array().length(3).items(Joi.string().required(), Joi.date().timestamp().required(), Joi.date().timestamp().required());
//
const dataSchema =  Joi.array().items(stepSchema).required();

module.exports = function (RED) {

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty('group')) {
            return false;
        } else {
            return true;
        }

    }

    function HTML(config, dark) {
        var configAsJson = JSON.stringify(config);
        var mid = (dark) ? "_midnight" : "";
        var html = String.raw`
                <style>.nr-dashboard-ui_table { padding:0; }</style>
                 <script type='text/javascript' src='ui-timeline/js/moment.min.js'></script>
                <script type='text/javascript' src='ui-timeline/js/Chart.js'></script>
                <script type='text/javascript' src='ui-timeline/js/timeline.js'></script>
                <script type='text/javascript' src='ui-timeline/js/chartjs-plugin-gridline-background.js'></script>

                <div id="timeline-section" style="position: relative; height:50vh; width:100%">
                    <canvas id="timeline-canvas-{{$id}}"></canvas>
                </div>
                <input type='hidden' ng-init='init(` + configAsJson + `)'>
            `;
        return html;
    };

    function TimelineNode(config) {
        RED.nodes.createNode(this, config)
        try {
            if (checkConfig(node, config)) {
                var ui = RED.require('node-red-dashboard')(RED);
                this.outformat = config.outformat;
                var node = this;
                var group = RED.nodes.getNode(config.group);
                if (!group) {
                    return;
                }
                var tab = RED.nodes.getNode(group.config.tab);
                if (!tab) {
                    return;
                }

                node.on("input", function (msg) {
                    var validation = dataSchema.validate(msg.payload);
                    if (validation.error) {
                        this.error('Payload not valid for timeline data creation : \n' + validation.error);
                        throw new Error('Timeline input erreur -' + validation.error);
                    } else {
                        this.debug('Payload valid for timeline creation:\n');
                        this.debug(JSON.stringify(msg.payload));
                    }
                });
                var done = ui.addWidget({
                    node: node,
                    order: config.order,
                    group: config.group,
                    label: config.label,
                    format: HTML(config, ui.isDark()),
                    order: config.order,
                    group: config.group,
                    forwardInputMessages: true,
                    storeFrontEndInputAsState: true,
                    control: {
                        type: 'ui_timeline',
                        label: config.label,
                        tooltip: config.tooltip,
                        color: config.color,
                        bgcolor: config.bgcolor,
                        icon: config.icon,
                        order: config.order,
                        format: config.bgcolor,
                        width: config.width || group.config.width || 3,
                        height: config.height || 1
                    },
                    initController: function ($scope, events) {

                        $scope.inited = false;

                        let buildDataSets = function (data = []) {
                            var result = [];
                            data.forEach(elmt => {
                                var dataSet = {
                                    data: [],

                                };
                                dataSet.data.push(elmt);
                                result.push(dataSet);
                            })


                            return result;
                        }

                        let buildLabelTab = function (data = []) {
                            const labels = data.map(obj => obj[2]);

                            return labels;
                        }


                        $scope.init = function (config) {
                            $scope.config = config;
                            $scope.inited = true;

                            Object.assign(config, {timelineCanvas: 'timeline-canvas-' + $scope.$eval('$id')});

                            var stateCheck = setInterval(function () {
                                if (document.getElementById(config.timelineCanvas)) {
                                    clearInterval(stateCheck);
                                    $scope.inited = true;
                                    var ctx = document.getElementById(config.timelineCanvas).getContext("2d");

                                    var colorIndex = 0;

                                    console.log('Timeline chart creation with: ', config);
                                    var chart = new Chart(ctx, {
                                        type: "timeline",
                                        options: {
                                            elements: {
                                                colorFunction: function (text, data, dataset, index) {
                                                    if (colorIndex > $scope.timeline.data.labels.length - 1) {
                                                        colorIndex = 0;
                                                    }
                                                    return config.colorCodes[colorIndex++];
                                                },
                                                showText: config.showText,
                                                textPadding: config.textPadding,
                                            },
                                            responsive: config.responsive,
                                            maintainAspectRatio: true,
                                            scales: {
                                                // xAxes: [{gridLines: { color: "#131c2b" }}],
                                                // yAxes: [{gridLines: { color: "#131c2b" }, }],
                                                yAxes: [{
                                                    gridLines: {
                                                        //backgroundColor: [ '#DCDCDC', 'snow' ],
                                                        backgroundColor: [config.bgColor1, config.bgColor2],
                                                        backgroundColorRepeat: config.backgroundColorRepeat
                                                    },
                                                    ticks: {
                                                        fontColor: "#111111",
                                                        fontStyle: 'inherit',
                                                        fontSize: 18,
                                                        fontFamily: 'Arial, Arial, Helvetica, sans-serif',
                                                        beginAtZero: true,
                                                        display: true
                                                    }
                                                }],
                                                xAxes: [{
                                                    ticks: {
                                                        fontColor: "#111111",
                                                        fontStyle: 'inherit',
                                                        fontSize: 18,
                                                        fontFamily: 'Arial, Arial, Helvetica, sans-serif',
                                                        beginAtZero: true,
                                                        display: true
                                                    }
                                                }]
                                            },
                                        },
                                        data: {
                                            labels: config.labels ? config.labels : [],
                                            datasets: config.datasets ? config.datasets : [],
                                        },
                                    });
                                    $scope.timeline = chart;
                                    if (chart) {
                                        console.log('Timeline chart successfully created : ', chart.canvas.id);
                                    } else {
                                        console.error('The timeline chart has not been created!');
                                    }
                                }
                            }, 200);
                        }

                        $scope.$watch('msg', function (msg) {
                            if ($scope.timeline) {
                                const datas = msg.payload.map(obj => {
                                    var res = [];
                                    res.push(obj[1]);
                                    res.push(obj[2]);
                                    res.push(obj[0]);
                                    return res
                                })
                                $scope.timeline.data.labels = buildLabelTab(datas);
                                $scope.timeline.data.datasets = buildDataSets(datas);
                                $scope.timeline.update();
                                $scope.timeline.canvas.parentNode.style.height = $scope.timeline.data.labels.length*100+'px';
                                $scope.timeline.canvas.style.height = $scope.timeline.data.labels.length*100+'px';
                           }
                        });

                    },

                    beforeEmit: function (msg, value) {
                        return {
                            msg: {
                                payload: value,
                                ui_control: config.ui_control,
                                socketid: msg.socketid
                            }
                        };

                    },

                    beforeSend: function (msg) {

                    },
                    convert: function (value) {
                        if (value === null) value = undefined;
                        return value;
                    },
                });
                node.on("close", done);
            } else {
                this.error(RED._('timeline.error.no-group'));
            }
        } catch (Error){

            this.error(RED._('timeline.error.no-creation'));
            this.error(Error);
        }
    }

    RED.nodes.registerType('ui_timeline', TimelineNode);

    var uipath = 'ui';
    if (RED.settings.ui) {
        uipath = RED.settings.ui.path;
    }
    var fullPath = path.join('/', uipath, '/ui-timeline/*').replace(/\\/g, '/');
    RED.httpNode.get(fullPath, function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });
};