﻿/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbitests {
    import DataViewTransform = powerbi.data.DataViewTransform;
    import DataShapeUtility = powerbi.data.dsr.DataShapeUtility;
    import ComboChart = powerbi.visuals.ComboChart;
    import ComboChartDataViewObjects = powerbi.visuals.ComboChartDataViewObjects;
    import SemanticType = powerbi.data.SemanticType;
    import ColorConvertor = powerbitests.utils.ColorUtility.convertFromRGBorHexToHex;
    import AxisType = powerbi.axisType;
    var DefaultWaitForRender = 100;

    describe("ComboChart", () => {
        it('registered capabilities', () => {
            expect(powerbi.visuals.visualPluginFactory.create().getPlugin('comboChart').capabilities).toBe(ComboChart.capabilities);
            expect(powerbi.visuals.visualPluginFactory.create().getPlugin('lineClusteredColumnComboChart').capabilities).toBe(ComboChart.capabilities);
            expect(powerbi.visuals.visualPluginFactory.create().getPlugin('lineStackedColumnComboChart').capabilities).toBe(ComboChart.capabilities);
        });

        it('capabilities should include dataViewMappings', () => {
            expect(ComboChart.capabilities.dataViewMappings).toBeDefined();
        });

        it('capabilities should include dataRoles', () => {
            expect(ComboChart.capabilities.dataRoles).toBeDefined();
        });

        it('Capabilities should not suppressDefaultTitle', () => {
            expect(ComboChart.capabilities.suppressDefaultTitle).toBeUndefined();
        });

        it('FormatString property should match calculated', () => {
            expect(powerbi.data.DataViewObjectDescriptors.findFormatString(powerbi.visuals.ComboChart.capabilities.objects)).toEqual(powerbi.visuals.comboChartProps.general.formatString);
        });
    });

    describe("ComboChart DOM validation", () => {
        var v: powerbi.IVisual, element: JQuery;
        function metadata(properties?: ComboChartDataViewObjects): powerbi.DataViewMetadata {
            return {
                columns: [
                    { displayName: 'col1', queryName: 'col1', type: DataShapeUtility.describeDataType(SemanticType.String) },
                    { displayName: 'col2', queryName: 'col2', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                    { displayName: 'col3', queryName: 'col3', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                    { displayName: 'col4', queryName: 'col4', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                ],
                properties: properties,
            };
        };

        function numericMetadata(objects?: ComboChartDataViewObjects): powerbi.DataViewMetadata {
            return {
                columns: [
                    { displayName: 'col1', queryName: 'col1', type: DataShapeUtility.describeDataType(SemanticType.Number) },
                    { displayName: 'col2', queryName: 'col2', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                    { displayName: 'col3', queryName: 'col3', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                    { displayName: 'col4', queryName: 'col4', isMeasure: true, type: DataShapeUtility.describeDataType(SemanticType.Number) },
                ],
                objects: objects,
            };
        };

        function dataViewWithSuperLongLabels(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = metadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['This is a pretty long label I think', 'This is a pretty long label I thought', 'This is a pretty long label I should think']
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [100, 200, 700],
                            subtotal: 1000
                        }, {
                            source: dataViewMetadata.columns[2],
                            values: [1000, 2000, 7000],
                            subtotal: 10000
                        }, {
                            source: dataViewMetadata.columns[3],
                            values: [1000000, 2000000, 7000000],
                            subtotal: 10000000
                        }])
                }
            };
        };

        function dataView(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = metadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['John Domo', 'Delta Force', 'Jean Tablau']
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [100, 200, 700],
                            subtotal: 1000
                        }, {
                            source: dataViewMetadata.columns[2],
                            values: [1000, 2000, 7000],
                            subtotal: 10000
                        }, {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 20000, 70000],
                            subtotal: 100000
                        }])
                }
            };
        };

        function dataViewWithInvalid(invalidType: string): powerbi.DataView {
            var val: number = NaN;
            switch (invalidType) {
                case 'PositiveInfinity':
                    val = Number.POSITIVE_INFINITY;
                    break;
                case 'NegativeInfinity':
                    val = Number.NEGATIVE_INFINITY;
                    break;
                case 'OutOfRange':
                    val = 1e301;
                    break;
                case 'NaN':
                    val = NaN;
                    break;
                default:
                    val = 3;
            }

            var dataViewMetadata = metadata();
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['John Domo']
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [val],
                            subtotal: 1000
                        }])
                }
            };
        }

        function dataViewNumeric(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = numericMetadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: [0, 500, 1000]
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [100, 200, 700],
                            subtotal: 1000
                        }, {
                            source: dataViewMetadata.columns[2],
                            values: [1000, 2000, 7000],
                            subtotal: 10000
                        }, {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 20000, 70000],
                            subtotal: 100000
                        }])
                }
            };
        };

        var emptyDataView = {
            metadata: metadata(),
            categorical: {
                categories: [{
                    source: metadata().columns[0],
                    values: []
                }],
                values: DataViewTransform.createValueColumns([])
            }
        };

        function dataViewInAnotherDomain(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = metadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['John Domo', 'Delta Force', 'Jean Tablau']
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [1],
                            subtotal: 1
                        }, {
                            source: dataViewMetadata.columns[2],
                            values: [10],
                            subtotal: 10
                        }, {
                            source: dataViewMetadata.columns[3],
                            values: [20],
                            subtotal: 20
                        }])
                }
            };
        };

        function dataViewInAnotherDomainOneValue(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = metadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['John Domo', 'Delta Force', 'Jean Tablau']
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [1],
                            subtotal: 1
                        }])
                }
            };
        };

        function dataViewForLabels(type: number): powerbi.DataView {
            var dataViewMetadata = metadata();

            if (type === 1) {
                return {
                    metadata: dataViewMetadata,
                    categorical: {
                        categories: [{
                            source: dataViewMetadata.columns[0],
                            values: ['a', 'b', 'c', 'd', 'e']
                        }],
                        values: DataViewTransform.createValueColumns([{
                            source: dataViewMetadata.columns[1],
                            values: [50, 40, 150, 200, 500],
                            subtotal: 200
                        }])
                    }
                };

            }
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['a', 'b', 'c', 'd', 'e']
                    }],
                    values: DataViewTransform.createValueColumns([{
                        source: dataViewMetadata.columns[1],
                        values: [200, 100, 300, 250, 400],
                        subtotal: 300
                    }])
                }
            };
        }

        function dataViewWithManyCategories(objects?: ComboChartDataViewObjects): powerbi.DataView {
            var dataViewMetadata = metadata(objects);
            return {
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: ['John Domo', 'Delta Force', 'Jean Tablau', 'Cat1', 'Cat2', 'Cat3', ]
                    }],
                    values: DataViewTransform.createValueColumns([
                        {
                            source: dataViewMetadata.columns[1],
                            values: [100, 200, 700],
                            subtotal: 1000
                        }, {
                            source: dataViewMetadata.columns[2],
                            values: [1000, 2000, 7000],
                            subtotal: 10000
                        },
                        {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 200, 700],
                            subtotal: 100000
                        },
                        {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 20000, 70000],
                            subtotal: 100000
                        },
                        {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 200, 700],
                            subtotal: 100000
                        },
                        {
                            source: dataViewMetadata.columns[3],
                            values: [10000, 20000, 70000],
                            subtotal: 100000
                        }])
                }
            };
        };

        beforeEach((done) => {

            var localizationService: powerbi.common.ILocalizationService = powerbi.common.createLocalizationService();
            powerbi.common.localize = localizationService;
            powerbitests.mocks.setLocale(localizationService);

            element = powerbitests.helpers.testDom('400', '400');
            v = powerbi.visuals.visualPluginFactory.create().getPlugin('comboChart').create();

            done();
        });

        it('Ensure both charts and axis created with two data views - default', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            v.onDataChanged({ dataViews: [dataView(), dataViewInAnotherDomain()] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);
                expect($('.legend').children.length).toBe(2);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y1).toEqual(y2);
                done();
            }, DefaultWaitForRender);
        });

        it('Ensure empty 1st dataview and populated 2nd has correct axes and lines',(done) => {
            // if two dataviews come back but the first is filtered to empty,
            // we should use the x-axis from the 2nd and move the y2 axis to be a y1 value axis.
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            v.onDataChanged({ dataViews: [emptyDataView, dataView()] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxisCount = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxisCount).toBe(2); //one is empty
                expect(legend).toBe(1);

                var yAxisPos = $('.y.axis').position();
                var rectCount = $('.columnChart .column').length;
                var lineCount = $('.lineChart .cat path').length;
                expect(yAxisPos.left).toBeLessThan(50);
                expect(rectCount).toBe(0);
                expect(lineCount).toBe(3);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y1).toEqual(4);
                expect(y2).toEqual(0);

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure comboCharts clear - default', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            v.onDataChanged({ dataViews: [dataViewInAnotherDomain(), dataView()] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;
                var rectCount = $('.columnChart .column').length;
                
                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);
                expect(rectCount).toBe(3);
                expect($('.legend').children.length).toBe(2);

                // clear line
                v.onDataChanged({ dataViews: [dataViewInAnotherDomain(), emptyDataView] });

                setTimeout(() => {
                    var rectCountNew = $('.columnChart .column').length;
                    expect(rectCountNew).toBe(3);
                    var catCountNew = $('.lineChart').find('.cat').length;
                    expect(catCountNew).toBe(0);

                    // clear columns, add back line
                    v.onDataChanged({ dataViews: [emptyDataView, dataView()] });

                    setTimeout(() => {
                        var rectCountFinal = $('.columnChart .column').length;
                        expect(rectCountFinal).toBe(0);
                        var catCountFinal = $('.lineChart').find('.cat').length;
                        expect(catCountFinal).toBe(3);

                        done();
                    }, DefaultWaitForRender);
                }, DefaultWaitForRender);
            }, DefaultWaitForRender);
        });

        it('Ensure both charts and only one axis created with two data views - default', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            v.onDataChanged({ dataViews: [dataView(), dataView()] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);
                expect($('.legend').children.length).toBe(2);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y2).toEqual(0);
                expect(y1).not.toEqual(y2);

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure both charts and axis created with two data views - stacked', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'ColumnStacked',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataView(objects), dataViewInAnotherDomain(objects)] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y1).toEqual(y2);
                done();
            }, DefaultWaitForRender);
        });

        it('Ensure both charts and One axis created with two data views - stacked', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'ColumnStacked',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataView(objects), dataView(objects)] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y2).toEqual(0);
                expect(y1).not.toEqual(y2);

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure both charts and axis created with two data views - clustered', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'ColumnClustered',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataView(objects), dataViewInAnotherDomain(objects)] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y1).toEqual(y2);
                done();
            }, DefaultWaitForRender);
        });

        it('Ensure both charts and only one axis created with two data views - clustered', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'Column',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataView(objects), dataView(objects)] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);

                var y1 = $($('.y.axis')[0]).find('.tick').length;
                var y2 = $($('.y.axis')[1]).find('.tick').length;
                expect(y2).toEqual(0);
                expect(y1).not.toEqual(y2);

                done();
            }, DefaultWaitForRender);
        });

        it('combo chart validate auto margin', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'Column',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataView(objects), dataView(objects)] });
            setTimeout(() => {
                var yTranslate = parseFloat($('.axisGraphicsContext .x.axis').attr('transform').split(',')[1].replace('(', ''));
                var xTranslate = parseFloat($('.axisGraphicsContext .y.axis').attr('transform').split(',')[0].split('(')[1]);
                v.onDataChanged({ dataViews: [dataViewWithSuperLongLabels(objects), dataViewWithSuperLongLabels(objects)] });
                setTimeout(() => {
                    var newYTranslate = parseFloat($('.axisGraphicsContext .x.axis').attr('transform').split(',')[1].replace('(', ''));
                    var newXTranslate = parseFloat($('.axisGraphicsContext .y.axis').attr('transform').split(',')[0].split('(')[1]);
                    expect(yTranslate).toBeGreaterThan(newYTranslate);
                    expect(newXTranslate).toBeGreaterThan(xTranslate);
                    done();
                }, DefaultWaitForRender);
            }, DefaultWaitForRender);
        });

        it('Ensure scrollbar is shown at smaller viewport dimensions',(done) => {
            element = powerbitests.helpers.testDom('100', '100');
            v = powerbi.visuals.visualPluginFactory.createMinerva({
                heatMap: false,
            }).getPlugin('lineClusteredColumnComboChart').create();

            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'ColumnClustered',
                    visualType2: 'Line',
                }
            };

            v.onDataChanged({ dataViews: [dataViewWithManyCategories(objects), dataViewWithManyCategories(objects)] });

            setTimeout(() => {
                var yAxis = $('.y.axis').length;               
                expect(yAxis).toBe(2);

                var y1 = $('.svgScrollable').attr('width');
                expect(y1).toBeLessThan(element.width());

                expect($('rect.extent').length).toBe(1);
                expect(parseInt($('.brush .extent')[0].attributes.getNamedItem('width').value, 0)).toBeGreaterThan(8);

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure all data points has the default color', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                },
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'ColumnClustered',
                    visualType2: 'Line',
                }                                
            };

            var dataView1 = dataView(objects);
            var dataView2 = dataViewInAnotherDomain(objects);            

            dataView1.metadata.objects = {
                dataPoint: {
                    defaultColor: { solid: { color: "#FF0000" } }                    
                }
            };  

            dataView2.metadata.objects = {
                dataPoint: {
                    defaultColor: { solid: { color: "#FF0000" } }
                }
            };  

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var lineCharts = $('.lineChart').length;
                var columnCharts = $('.columnChart').length;
                var yAxis = $('.y.axis').length;
                var legend = $('.legend').length;

                expect(lineCharts).toBe(1);
                expect(columnCharts).toBe(1);
                expect(yAxis).toBe(2);
                expect(legend).toBe(1);
                
                expect($($('.legendIcon')[0]).css('fill')).toBe("#ff0000");
                expect($($('.legendIcon')[2]).css('fill')).toBe("#ff0000");

                done();
            }, DefaultWaitForRender);
        });

        //Data Labels
        it('Ensure data labels are on both charts with default color', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });
            
            var dataView1 = dataViewForLabels(1);
            var dataView2 = dataViewForLabels(2);

            dataView1.metadata.objects = { labels: { show: true } };
            dataView2.metadata.objects = { labels: { show: true } };

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var columnLabels = $('.columnChartMainGraphicsContext .data-labels');
                var lineLabels = $('.dataLabelsSVG .data-labels');

                var columns = $('.columnChartMainGraphicsContext .column');
                var lines = $('.mainGraphicsContext .dot');

                expect(columnLabels.length).toBeGreaterThan(0);
                expect(lineLabels.length).toBeGreaterThan(0);

                var fillColumnLabel = columnLabels.first().css('fill');
                var fillLineLabel = lineLabels.first().css('fill');

                var fillColumn = columns.first().css('fill');
                var fillLine = lines.first().css('fill');

                expect(fillColumnLabel).toBe(fillColumn);
                expect(fillLineLabel).toBe(fillLine);

                done();
            }, DefaultWaitForRender);
        });

        it('labels should support display units with no precision', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var dataView1 = dataViewForLabels(1);
            var dataView2 = dataViewForLabels(2);

            dataView1.metadata.objects = { labels: { show: true, labelDisplayUnits: 1000, labelPrecision: 0 } };
            dataView2.metadata.objects = { labels: { show: true, labelDisplayUnits: 1000, labelPrecision: 0 } };

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var columnLabels = $('.columnChartMainGraphicsContext .data-labels');
                var lineLabels = $('.dataLabelsSVG .data-labels');

                expect(columnLabels.first().text()).toBe('0K');
                expect(lineLabels.first().text()).toBe('0K');

                done();
            }, DefaultWaitForRender);
        });
       
        it('labels should support display units with precision', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var dataView1 = dataViewForLabels(1);
            var dataView2 = dataViewForLabels(2);

            dataView1.metadata.objects = { labels: { show: true, labelDisplayUnits: 1000, labelPrecision: 1 } };
            dataView2.metadata.objects = { labels: { show: true, labelDisplayUnits: 1000, labelPrecision: 1 } };

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var columnLabels = $('.columnChartMainGraphicsContext .data-labels');
                var lineLabels = $('.dataLabelsSVG .data-labels');

                expect(columnLabels.first().text()).toBe('0.1K');
                expect(lineLabels.first().text()).toBe('0.2K');

                done();
            }, DefaultWaitForRender);
        });

        it('Values that have NaN show a warning.', (done) => {
            var hostService = mocks.createVisualHostServices();
            var warningSpy = jasmine.createSpy('warning');
            hostService.setWarnings = warningSpy;

            v.init({
                element: element,
                host: hostService,
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            v.onDataChanged({ dataViews: [dataViewWithInvalid('NaN')] });

            setTimeout(() => {
                expect(warningSpy).toHaveBeenCalled();
                expect(warningSpy.calls.count()).toBe(1);
                expect(warningSpy.calls.argsFor(0)[0][0].code).toBe('NaNNotSupported');
                done();
            }, DefaultWaitForRender);
        });

        it('Values that have Negative Infinity show a warning.', (done) => {
            var hostService = mocks.createVisualHostServices();
            v.init({
                element: element,
                host: hostService,
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var warningSpy = jasmine.createSpy('warning');
            hostService.setWarnings = warningSpy;

            v.onDataChanged({ dataViews: [dataViewWithInvalid('NegativeInfinity')] });

            setTimeout(() => {
                expect(warningSpy).toHaveBeenCalled();
                expect(warningSpy.calls.count()).toBe(1);
                expect(warningSpy.calls.argsFor(0)[0][0].code).toBe('InfinityValuesNotSupported');
                done();
            }, DefaultWaitForRender);
        });

        it('Values that have Positive Infinity show a warning.', (done) => {
            var hostService = mocks.createVisualHostServices();
            v.init({
                element: element,
                host: hostService,
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var warningSpy = jasmine.createSpy('warning');
            hostService.setWarnings = warningSpy;

            v.onDataChanged({ dataViews: [dataViewWithInvalid('PositiveInfinity')] });

            setTimeout(() => {
                expect(warningSpy).toHaveBeenCalled();
                expect(warningSpy.calls.count()).toBe(1);
                expect(warningSpy.calls.argsFor(0)[0][0].code).toBe('InfinityValuesNotSupported');
                done();
            }, DefaultWaitForRender);
        });

        it('Values that are out of range show a warning.', (done) => {
            var hostService = mocks.createVisualHostServices();
            v.init({
                element: element,
                host: hostService,
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var warningSpy = jasmine.createSpy('warning');
            hostService.setWarnings = warningSpy;

            v.onDataChanged({ dataViews: [dataViewWithInvalid('OutOfRange')] });

            setTimeout(() => {
                expect(warningSpy).toHaveBeenCalled();
                expect(warningSpy.calls.count()).toBe(1);
                expect(warningSpy.calls.argsFor(0)[0][0].code).toBe('ValuesOutOfRange');
                done();
            }, DefaultWaitForRender);
        });

        it('All values good do not show a warning.', (done) => {
            var hostService = mocks.createVisualHostServices();
            v.init({
                element: element,
                host: hostService,
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var warningSpy = jasmine.createSpy('warning');
            hostService.setWarnings = warningSpy;

            v.onDataChanged({ dataViews: [dataViewWithInvalid('Good')] });

            setTimeout(() => {
                expect(warningSpy).not.toHaveBeenCalled();
                done();
            }, DefaultWaitForRender);
        });

        it('Ensure data lables are on both charts with custom color', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var dataView1 = dataViewForLabels(1);
            var dataView2 = dataViewForLabels(2);
            var color = { solid: { color: "rgb(255, 0, 0)" } }; // Red

            dataView1.metadata.objects = { labels: { show: true, color: color } };
            dataView2.metadata.objects = { labels: { show: true, color: color } };

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var columnLabels = $('.columnChartMainGraphicsContext .data-labels');
                var lineLabels = $('.dataLabelsSVG .data-labels');
                
                // Commented because TSLINT throws exception on these vars: unused variable: 'columns', unused variable: 'lines'
                //var columns = $('.columnChartMainGraphicsContext .column');
                //var lines = $('.mainGraphicsContext .dot');

                expect(columnLabels.length).toBeGreaterThan(0);
                expect(lineLabels.length).toBeGreaterThan(0);

                var fillColumnLabel = columnLabels.first().css('fill');
                var fillLineLabel = lineLabels.first().css('fill');

                expect(ColorConvertor(fillColumnLabel)).toBe(ColorConvertor(color.solid.color));
                expect(ColorConvertor(fillLineLabel)).toBe(ColorConvertor(color.solid.color));

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure data lables are on both charts and removed', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var dataView1 = dataViewForLabels(1);
            var dataView2 = dataViewForLabels(2);

            dataView1.metadata.objects = { labels: { show: true } };
            dataView2.metadata.objects = { labels: { show: true } };

            v.onDataChanged({ dataViews: [dataView1, dataView2] });

            setTimeout(() => {
                var columnLabels = $('.columnChartMainGraphicsContext .data-labels');
                var lineLabels = $('.dataLabelsSVG .data-labels');

                expect(columnLabels.length).toBeGreaterThan(0);
                expect(lineLabels.length).toBeGreaterThan(0);

                dataView1.metadata.objects = { labels: { show: false } };
                dataView2.metadata.objects = { labels: { show: false } };

                v.onDataChanged({ dataViews: [dataView1, dataView2] });

                setTimeout(() => {
                var columnLabels2 = $('.columnChartMainGraphicsContext .data-labels');
                    var lineLabels2 = $('.dataLabelsSVG .data-labels');

                expect(columnLabels2.length).toBe(0);
                expect(lineLabels2.length).toBe(0);
                    done();
                }, DefaultWaitForRender);
                done();
            }, DefaultWaitForRender);
        });

        it('validate enumerate labels',(done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var dataView1 = dataViewForLabels(1);
            var dataView2 = null;

            v.onDataChanged({ dataViews: [dataView1, dataView2] });
            var points = v.enumerateObjectInstances({ objectName: 'labels' });

            setTimeout(() => {
                expect(points.length).toBeGreaterThan(0);
                done();
            }, DefaultWaitForRender);
        });

        it('xAxis customization- begin and end check',(done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });
            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'Column',
                    visualType2: 'Line',
                },
                categoryAxis: {
                    displayName: 'scalar',
                    show: true,
                    start: 0,
                    end: 1000,
                    axisType: AxisType.scalar,
                    showAxisTitle: true,
                    axisStyle: true
                }
            };
            v.onDataChanged({ dataViews: [dataViewNumeric(objects), dataViewNumeric(objects)] });

            setTimeout(() => {
                var labels = $('.x.axis').children('.tick');

                //Verify begin&end labels
                expect(labels[0].textContent).toBe('0K');
                expect(labels[labels.length - 1].textContent).toBe('1K');

                done();
            }, DefaultWaitForRender);
        });

        it('Verify force to zero works for a positive domain range',(done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });
            var dataViewMetadata = metadata();
            var dataView =
                {
                    metadata: dataViewMetadata,
                    categorical: {
                        categories: [{
                            source: dataViewMetadata.columns[0],
                            values: ['John Domo', 'Delta Force', 'Jean Tablau']
                        }],
                        values: DataViewTransform.createValueColumns([
                            {
                                source: dataViewMetadata.columns[1],
                                values: [4000, 6000, 7000],
                                subtotal: 17000
                            }])
                    }
                };
            v.onDataChanged({ dataViews: [dataViewInAnotherDomain(), dataView] });
            setTimeout(() => {
                var axisLabels = $('.axisGraphicsContext .y.axis').last().find('.tick');
                //Verify begin&end labels
                expect(axisLabels[0].textContent).toBe('0K');
                expect(axisLabels[axisLabels.length - 1].textContent).toBe('7K');

                done();
            }, DefaultWaitForRender);
        });

        it('Verify force to zero is not set for a negative domain range',(done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });
            var dataViewMetadata = metadata();
            var dataView =
                {
                    metadata: dataViewMetadata,
                    categorical: {
                        categories: [{
                            source: dataViewMetadata.columns[0],
                            values: ['John Domo', 'Delta Force', 'Jean Tablau']
                        }],
                        values: DataViewTransform.createValueColumns([
                            {
                                source: dataViewMetadata.columns[1],
                                values: [-4000, -6000, -7000],
                                subtotal: -17000
                            }])
                    }
                };
            v.onDataChanged({ dataViews: [dataViewInAnotherDomain(), dataView] });
            setTimeout(() => {
                var axisLabels = $('.axisGraphicsContext .y.axis').last().find('.tick');
                //Verify begin&end axis labels
                expect(axisLabels[0].textContent).toBe('-7K');
                expect(axisLabels[axisLabels.length - 1].textContent).toBe('-4K');

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure both titles created in Line and Stacked column chart', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'Column',
                    visualType2: 'Line',
                },
                valueAxis: {
                    show: true,
                    showAxisTitle: true,
                    secShowAxisTitle: true
                }
            };

            v.onDataChanged({
                dataViews: [dataViewNumeric(objects), dataViewInAnotherDomainOneValue(objects)]
            });

            setTimeout(() => {
                var lineAxisLabel = $('.yAxisLabel').length;
                expect(lineAxisLabel).toBe(2);
                expect($('.yAxisLabel').first().text()).toBe('col2, col3 and col4');
                expect($('.yAxisLabel').last().text()).toBe('col2');

                done();
            }, DefaultWaitForRender);
        });

        it('Ensure only secondary title created in Line and Stacked column chart', (done) => {
            v.init({
                element: element,
                host: mocks.createVisualHostServices(),
                style: powerbi.visuals.visualStyles.create(),
                viewport: {
                    height: element.height(),
                    width: element.width()
                }
            });

            var objects: ComboChartDataViewObjects = {
                general: {
                    visualType1: 'Column',
                    visualType2: 'Line',
                },
                valueAxis: {
                    show: true,
                    showAxisTitle: false,
                    secShowAxisTitle: true
                }
            };

            v.onDataChanged({
                dataViews: [dataViewNumeric(objects), dataViewInAnotherDomainOneValue(objects)]
            });

            setTimeout(() => {
                var lineAxisLabel = $('.yAxisLabel').length;
                expect(lineAxisLabel).toBe(1);
                expect($('.yAxisLabel').first().text()).toBe('col2');

                done();
            }, DefaultWaitForRender);
        });

    });
}