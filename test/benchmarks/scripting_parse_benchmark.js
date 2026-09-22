(()=> {

// Imports the connector with the #import macro. Since the connector in turn
// uses the #export macro, it can then be used in the global scope.
#import benchmark/connector;

// Imports the mock-up tools with which the application behaves more realistic
#import benchmark/mockup;

const API_HOST_URL = window.location.contextPath + "/api/" + DataSource.locale;
const API_LIST_MARKET_URL = API_HOST_URL + "/listMarket";
const API_LIST_DATATYPES_URL = API_HOST_URL + "/listDatatype";
const API_SEARCH_NEWS_URL = API_HOST_URL + "/searchNews";
const API_SEND_NEWSLETTER_URL = window.location.contextPath + "/api/sendNewsletter";
const API_MEDIA_IMAGES_URL = window.location.contextPath + "/api/media/";

const PIAAS_URL = window.location.contextPath + "/";

const DATATYPE_BRANDS_ID = 1;
const DATATYPE_PRODUCT_GROUPS = 2;
const DATATYPE_PRODUCTS_ID = 3;
const DATATYPE_TECHNICAL_DATA_ID = 4;
const DATATYPE_EQUIPMENTS_ID = 5;
const DATATYPE_IMAGES_ID = 6;
const DATATYPE_ACCESSORIES_ID = 7;
const DATATYPE_MARKETING_TEXTS_ID = 8;
const DATATYPE_SERVICES_ID = 9;
const DATATYPE_MEDIA_ID = 10;

const FUNCTION_PREVIEW_YOU = 1;
const FUNCTION_PREVIEW_EMAIL = 2;
const FUNCTION_RECIPIENTS = 3;
const FUNCTION_PUBLISH = 4;

#export FUNCTION_PREVIEW_YOU FUNCTION_PREVIEW_EMAIL FUNCTION_RECIPIENTS FUNCTION_PUBLISH;

const news = Reactive({
    market: {
        list: null,
        value: "",
        get text() {
            if (this.value
                    && this.list)
                return this.list.find(record => record.id === this.value).text;
            return "";
        },
        get disabled() {
            return this.list && this.list.length ? undefined : true;
        },
        onChange() {
            if (this.value) {
                connector.call("GET", API_LIST_DATATYPES_URL + "/" + this.value, null, (status, json) => {
                    if (status instanceof Error)
                        throw status;
                    news.datatype.list = json;
                    news.datatype.value = "";
                });
            }
        }
    },
    datatype: {
        list: null,
        value: "",
        get text() {
            if (this.value
                    && this.list)
                return this.list.find(record => record.id === this.value).text;
            return "";
        },
        get disabled() {
            if (!this.list
                    || !this.list.length)
                return true;
            return news.market.value ? undefined : true;
        }
    },
    search: {
        get disabled() {
            return news.market.value && news.datatype.value
                ? undefined : true;
        },
        onClick() {

            news.recipients.list = null;

            connector.call("GET", API_SEARCH_NEWS_URL + "/" + news.market.value + "/" + news.datatype.value, null, (status, json) => {
                if (status instanceof Error)
                    throw status;
                news.list.marketId = parseInt(news.market.value);
                news.list.market = news.market.text;
                news.list.datatypeId = parseInt(news.datatype.value);
                news.list.datatype = news.datatype.text;

                json = Mockup.filterRecords(news.list.datatypeId, json);

                // target url of the record must be set qualified
                // images must be made market related
                json.forEach((record, index) => {
                    record.targetUrl = PIAAS_URL
                        + news.datatype.text.replace(/\s+/g, "-").toLowerCase()
                        + "/" + record.id;
                    if (record.images)
                        record.images = record.images.map(image =>
                            API_MEDIA_IMAGES_URL + news.market.value + "/" + image);
                });

                // additional fields for the view must be added before rendering
                // if they are to be used reactive, because during rendering the
                // consumers of the fields are detected
                json.forEach((record, index) => {
                    record.selected = false;
                    record.active = true;
                });

                news.list.records = json;
            });
        }
    },
    list: {
        marketId: null,
        market: null,
        datatypeId: null,
        datatype: null,
        records: null,
        get exists() {
            return this.market && this.datatype;
        },
        get empty() {
            return this.length <= 0;
        },
        get length() {
            return this.filter().length;
        },
        isProductGroup(record) {
            return record
                && record.datatype === DATATYPE_PRODUCT_GROUPS
                && this.datatypeId !== DATATYPE_PRODUCT_GROUPS;
        },
        filter() {
            return (this.records || []).filter(record =>
                !news.list.isProductGroup(record));
        }
    },
    selection: {
        get status() {
            // status knows three states of selection:
            //     not (undefined), partial, all
            const records = news.list.filter();
            const active = records.filter(record =>
                record.active).length;
            const selectable = records.filter(record =>
                record.active && !record.selected).length;
            if (records.length <= 0
                    || active <= 0
                    || active === selectable)
                return undefined;
            return selectable === 0 ? "all" : "partial";
        },
        get records() {
            return news.list.filter().filter(record =>
                record.active && record.selected);
        },
        onClick(event) {
            const unique = String(event.target.id.match(/[^#]+$/));
            if (unique === "toggle") {
                const selected = this.status !== "all";
                news.list.filter()
                    .filter(record =>
                        record.active)
                    .forEach(record =>
                        record.selected = selected);
                event.target.checked = !!this.status;
            } else news.list.records[unique].selected = !news.list.records[unique].selected;
        }
    },
    function: {
        value: "",
        recipients: {
            value: "",
            error: ""
        },
        apply: {
            get disabled() {
                // simple condition, because string and number are compared
                const disabled = !news.selection.status
                        || !news.function.value
                        || (news.function.value == FUNCTION_PREVIEW_EMAIL
                                && (!news.function.recipients.value || news.function.recipients.error))
                return disabled ? true : undefined;
            },
            onClick() {
                if (this.disabled)
                    return;

                // In the tutorial only a GET request, otherwise POST + payload
                // of the data for sending mail.
                connector.call("GET", API_SEND_NEWSLETTER_URL, null, (status, json) => {
                    if (status instanceof Error)
                        throw status;

                    // The response is a JSON file containing the echo of the
                    // called function and a detailed list of recipients. This
                    // is simulated in the tutorial with JavaScript.
                    // To reflect the low implementation effort, mockup was
                    // outsourced to an extra module.
                    news.recipients.list = Mockup.sendNewsletter(parseInt(news.function.value),
                        news.function.recipients.value.split(/\s+/),
                        news.selection.records.map(record => record.id)).recipients;

                    if (news.function.value != FUNCTION_PUBLISH)
                        return;

                    news.selection.records.forEach(record => {
                        record.active = false;
                        record.selected = false;
                    });
                });
            }
        }
    },
    recipients: {
        list: null,
        get exists() {
            return this.list !== null;
        },
        get empty() {
            return this.length <= 0;
        },
        get length() {
            return (this.list || []).length;
        }
    }
});

// Object news was declared as const in the current scope. To make it globally
// usable, it is made public with the #export macro.
#export news;

// Test of invalid macros #import !!!
console.log("#import !!!");
console.log('#import !!!');
console.log(`#import !!!`);
/* #import !!! */

// Test of invalid macros #export !!!
console.log("#export !!!");
console.log('#export !!!');
console.log(`#export !!!`);
/* #export !!! */
});