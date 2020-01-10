"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var time_1 = require("../../../velocity/util/time");
describe('Velocity $context.util.time', function () {
    var dateNowSpy;
    var time;
    var FORMAT_CUSTOM_ZONED = 'yyyy-MM-dd HH:mm:ss.SSS Z';
    var FORMAT_CUSTOM_UNZONED = 'yyyy-MM-dd HH:mm:ss.SSS';
    var TEST_TIMESTAMP_MILLIS = 1267378472045; // 2010-02-28T17:34:32.045Z
    var TEST_TIMESTAMP_SECS = 1267378472;
    var TEST_TIMESTAMP_ZULU = '2010-02-28T17:34:32.045Z';
    var TEST_TIMESTAMP_PLUS8 = '2010-03-01T01:34:32.045+08:00';
    var TEST_TIMESTAMP_CUSTOM_UTC = '2010-02-28 17:34:32.045 +0000';
    var TEST_TIMESTAMP_CUSTOM_PLUS8 = '2010-03-01 01:34:32.045 +0800';
    var TEST_TIMESTAMP_CUSTOM_UTC_UNZONED = '2010-02-28 17:34:32.045';
    var TEST_TIMESTAMP_CUSTOM_PLUS8_UNZONED = '2010-03-01 01:34:32.045';
    beforeAll(function () {
        // freeze time
        time = time_1.time();
        dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(function () { return TEST_TIMESTAMP_MILLIS; });
    });
    afterAll(function () {
        // unfreeze time
        dateNowSpy.mockRestore();
    });
    it('nowISO8601', function () {
        expect(time.nowISO8601()).toEqual(TEST_TIMESTAMP_ZULU);
    });
    it('nowEpochSeconds', function () {
        expect(time.nowEpochSeconds()).toEqual(TEST_TIMESTAMP_SECS);
    });
    it('nowEpochMilliSeconds', function () {
        expect(time.nowEpochMilliSeconds()).toEqual(TEST_TIMESTAMP_MILLIS);
    });
    it('parseFormattedToEpochMilliSeconds', function () {
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_UTC, FORMAT_CUSTOM_ZONED)).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_PLUS8, FORMAT_CUSTOM_ZONED)).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_UTC, FORMAT_CUSTOM_ZONED)).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_PLUS8, FORMAT_CUSTOM_ZONED, 'Australia/Perth')).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_UTC_UNZONED, FORMAT_CUSTOM_UNZONED, 'UTC')).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseFormattedToEpochMilliSeconds(TEST_TIMESTAMP_CUSTOM_PLUS8_UNZONED, FORMAT_CUSTOM_UNZONED, 'Australia/Perth')).toEqual(TEST_TIMESTAMP_MILLIS);
    });
    it('parseISO8601ToEpochMilliSeconds', function () {
        expect(time.parseISO8601ToEpochMilliSeconds(TEST_TIMESTAMP_ZULU)).toEqual(TEST_TIMESTAMP_MILLIS);
        expect(time.parseISO8601ToEpochMilliSeconds(TEST_TIMESTAMP_PLUS8)).toEqual(TEST_TIMESTAMP_MILLIS);
    });
    it('epochMilliSecondsToSeconds', function () {
        expect(time.epochMilliSecondsToSeconds(TEST_TIMESTAMP_MILLIS)).toEqual(TEST_TIMESTAMP_SECS);
    });
    it('epochMilliSecondsToISO8601', function () {
        expect(time.epochMilliSecondsToISO8601(TEST_TIMESTAMP_MILLIS)).toEqual(TEST_TIMESTAMP_ZULU);
    });
    it('epochMilliSecondsToFormatted', function () {
        expect(time.epochMilliSecondsToFormatted(TEST_TIMESTAMP_MILLIS, FORMAT_CUSTOM_ZONED)).toEqual(TEST_TIMESTAMP_CUSTOM_UTC);
        expect(time.epochMilliSecondsToFormatted(TEST_TIMESTAMP_MILLIS, FORMAT_CUSTOM_ZONED, 'Australia/Perth')).toEqual(TEST_TIMESTAMP_CUSTOM_PLUS8);
    });
});
//# sourceMappingURL=time.test.js.map