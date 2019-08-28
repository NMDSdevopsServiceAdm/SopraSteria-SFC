// Local Authority user's report
const express = require('express');
const router = express.Router();

// for database
const models = require('../../../models');

// for establishment entity
const Establishment = require('../../../models/classes/establishment').Establishment;

const EXAMPLE_XLS_FILE = '0M8R4KGxGuEAAAAAAAAAAAAAAAAAAAAAOwADAP7/CQAGAAAAAAAAAAAAAAABAAAALAAAAAAAAAAAEAAAKQAAAAEAAAD+////AAAAAAAAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/////////wMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAAFAAAABUAAAAWAAAAFwAAABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACQAAAAlAAAAJgAAACcAAAAoAAAA/v////7///8rAAAA/v///y0AAAD+/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1IAbwBvAHQAIABFAG4AdAByAHkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWAAUA////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v///wAAAAAAAAAACQgQAAAGBQC7DcwHAAAAAAYAAADhAAIAsATBAAIAAADiAAAAXABwAAQAAENhbGMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCAAIAsARhAQIAAADAAQAAPQEGAAEAAgADAJwAAgAOAK8BAgAAALwBAgAAAD0AEgAAAAAAAEAAIDgAAAAAAAEA9AFAAAIAAACNAAIAAAAiAAIAAAAOAAIAAQC3AQIAAADaAAIAAAAxABoAyAAAAP9/kAEAAAAAAAAFAUEAcgBpAGEAbAAxABoAyAAAAP9/kAEAAAAAAAAFAUEAcgBpAGEAbAAxABoAyAAAAP9/kAEAAAAAAAAFAUEAcgBpAGEAbAAxABoAyAAAAP9/kAEAAAAAAAAFAUEAcgBpAGEAbAAxABoA7wAAABIAvAIAAAAAAQAFAUEAcgBpAGEAbAAxABoAoAAAAAgAkAEAAAAAAQAFAUEAcgBpAGEAbAAxABoAoAAEAAgAvAIAAAEAAQAFAUEAcgBpAGEAbAAxABoAoAAAAAkAkAEAAAAAAQAFAUEAcgBpAGEAbAAxABoAoAAAAAgAvAIAAAAAAQAFAUEAcgBpAGEAbAAxABoAyAAAAAgAkAEAAAAAAQAFAUEAcgBpAGEAbAAxABoAoAAAAAoAkAEAAAAAAQAFAUEAcgBpAGEAbAAeBAwApAAHAABHZW5lcmFsHgQLAKUABgAAIzAuMFwlHgQcAKYAFwAAXKMjLCMjMC4wMDsiLaMiIywjIzAuMDDgABQAAACkAPX/IAAAAAAAAAAAAAAAwCDgABQAAQAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAQAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAgAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAgAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAAAAAPX/IAAA9AAAAAAAAAAAwCDgABQAAACkAAEAIAAAAAAAAAAAAAAAwCDgABQAAQArAPX/IAAA8AAAAAAAAAAAwCDgABQAAQApAPX/IAAA8AAAAAAAAAAAwCDgABQAAQAsAPX/IAAA8AAAAAAAAAAAwCDgABQAAQAqAPX/IAAA8AAAAAAAAAAAwCDgABQAAQAJAPX/IAAA8AAAAAAAAAAAwCDgABQABQCkAAAACQBAuBERiQSJBAAAwCDgABQABgCkAAAACABAuAAAAAAAAAAAwCDgABQABwCkAAAACABAuAAAAAAAAAAAwCDgABQACACkAAAACABA+AEBCAAIAAAEEhDgABQACACkAAAACABA+BABAAQIAAAEEhDgABQABgCkAAAACABAuBERCAQIBAAAwCDgABQACQCkAAAACABAuAAAAAAAAAAAwCDgABQACgCkAAAACABAuBERCAQIBAAAwCDgABQACACkAAAACABA+BERCAQIBAAEEhDgABQACACkAAAACABA+BAAAAQAAAAECQ3gABQACACkAAAACgBA+BERCAQIBAAEEhDgABQACACkAAAAKABA+BERCAQIBAAEEhDgABQACACkAAAAKgBA+BERCAQIBAAEEhDgABQACQCkAAAACABAuBFECAQIBAAAwCDgABQABgCkAAAACABAuERECAQIBAAAwCDgABQABgCkAAAACABAuBRECAQIBAAAwCDgABQABgCkAAAACwBAuERECAQIBAAAwCDgABQABgClAAAACwBAvERECAQIBAAAwCDgABQABgClAAAACwBAvBRECAQIBAAAwCDgABQABgCkAAAACQBAuBRECAQIBAAAwCDgABQABgCkAAAACwBAuBRECAQIBAAAwCDgABQABgCkAAAACABAuBFBCAQIBAAAwCDgABQABgCkAAAACABAuERBCAQIBAAAwCDgABQACwCkAAAACABAuBRBCAQIBAAAwCDgABQABgCkAAAACwBAuERBCAQIBAAAwCDgABQACwClAAAACwBAvERBCAQIBAAAwCDgABQACwClAAAACwBAvBRBCAQIBAAAwCDgABQABgCkAAAACQBAuBRBCAQIBAAAwCDgABQABgCkAAAACwBAuBRBCAQIBAAAwCDgABQABgClAAAACwBAvBRBCAQIBAAAwCDgABQABgCkAAAACABAuBFECAQIBAAAwCDgABQACwCkAAAACABAuBRECAQIBAAAwCDgABQACwCkAAAACABAuERECAQIBAAAwCDgABQACwCkAAAACwBAuERECAQIBAAAwCDgABQACwClAAAACwBAvBRECAQIBAAAwCDgABQACwClAAAACwBAvERECAQIBAAAwCDgABQABgCkAAAACABAuBEUCAQIBAAAwCDgABQABgCkAAAACABAuEQUCAQIBAAAwCDgABQACwCkAAAACABAuBQUCAQIBAAAwCDgABQAAACkAAAACAAAsAAQAAAABAAAwCDgABQACwCkAAAACABAuEQUCAQIBAAAwCDgABQACwCkAAAACwBAuEQUCAQIBAAAwCDgABQACwClAAAACwBAvEQUCAQIBAAAwCDgABQABgCkAAAACwBAuEQUCAQIBAAAwCDgABQACwClAAAACwBAvBQUCAQIBAAAwCDgABQABgCkAAAACQBAuBQUCAQIBAAAwCDgABQABgCkAAAACwBAuBQUCAQIBAAAwCDgABQABgClAAAACwBAvBQUCAQIBAAAwCDgABQAAACkAAAACAAAsAABAAAIAAAAwCDgABQABgCmAAAACABAvERECAQIBAAAwCDgABQACwCmAAAACABAvERECAQIBAAAwCDgABQABgCmAAAACABAvEQUCAQIBAAAwCCTAgQAAIAA/5MCBAAQgAP/kwIEABGABv+TAgQAEoAE/5MCBAATgAf/kwIEABSABf+SAOIAOAAAAAAA////AP8AAAAA/wAAAAD/AP//AAD/AP8AAP//AIAAAAAAgAAAGRlwAICAAACAAIAAAICAAMDAwACAgIAAmZn/AJkzZgD//8wAzP//AGYAZgD/gIAAAGbMAMzM/wAAAIAA/wD/AP//AAAA//8AgACAAIAAAAAAgIAAAAD/AADM/wDM//8AzP/MAP//mQCZzP8A/5nMAMyZ/wD/zJkAM2b/ADPMzACZzAAA/8wAAP+ZAAD/ZgAAZmaZAJaWlgAAM2YAM5lmAAAzAAAzMwAAmTMAAJkzZgAzM5kAMzMzAGABAgAAAIUAFACpHQAAAAAMAEludHJvZHVjdGlvboUAEgDcLAAAAAAKAFdvcmtwbGFjZXOFABUANTsAAAAADQBTdGFmZiBSZWNvcmRzjAAEAAEAAQCuAQQAAwABBBcAFAADAAAAAAAAAAAAAgACAAAAAQABABgAGwAgAAABCwAAAAEAAAAAAAAHOwAAAAACAAAA/wAYABsAIAAAAQsAAAADAAAAAAAABzsBAAAAAgAAAP8AGAAbACAAAAELAAAAAgAAAAAAAAc7AgAAAAIAAAD/AMEBCADBAQAAVI0BAOsAagAPAADwYgAAAAAABvAoAAAAAAwAAAQAAAADAAAAAwAAAAEAAAABAAAAAgAAAAEAAAADAAAAAQAAADMAC/ASAAAAvwAIAAgAgQEJAAAIwAFAAAAIQAAe8RAAAAANAAAIDAAACBcAAAj3AAAQ/AC5EVgBAACdAAAAHwAATG9jYWwgYXV0aG9yaXR5IHByb2dyZXNzIHJlcG9ydKEBAFRoaXMgcmVwb3J0IGhhcyBiZWVuIGRldmVsb3BlZCB0byBhc3Npc3QgbG9jYWwgYXV0aG9yaXRpZXMgaW4gY29tcGxldGluZyB0aGUgQVNDLVdEUy4KRWFjaCBsb2NhbCBhdXRob3JpdHkgc2hvdWxkIG1ha2UgYW4gQVNDLVdEUyByZXR1cm4gYmV0d2VlbiBTZXB0ZW1iZXIgOXRoIDIwMTkgYW5kIE9jdG9iZXIgMTF0aCAyMDE5IGFzIHRoZWlyIHdvcmtmb3JjZSBkYXRhIHJldHVybi4KTm90ZTogTG9jYWwgYXV0aG9yaXRpZXMgd2l0aCBtb3JlIHRoYW4gb25lIHBhcmVudCBhY2NvdW50IHdpbGwgaGF2ZSB0byBydW4gdGhpcyByZXBvcnQgc2VwYXJhdGVseSBmb3IgZWFjaCBhY2NvdW50LiBUaGUgQVNDLVdEUyBTdXBwb3J0IFRlYW0gd2lsbCBiZSBhYmxlIHRvIGFkdmlzZSBvbiBvdmVyYWxsIGNvbXBsZXRpb24gaWYgbmVjZXNzYXJ5LggAAENvbnRlbnRzDAAAU2hlZXQgbnVtYmVyCwAARGVzY3JpcHRpb24HAABTaGVldCAxHAAASW50cm9kdWN0aW9uIGFuZCBkZWZpbml0aW9ucwcAAFNoZWV0IDIdAABXb3JrcGxhY2UvdGVhbSBsZXZlbCBvdmVydmlldwcAAFNoZWV0IDMQAABTdGFmZiBsZXZlbCBkYXRhCwAARGVmaW5pdGlvbnMNAABBbGwgYWR1bHRzIC0gWAAAQWxsIHdvcmtwbGFjZS8gdGVhbXMgd2l0aCBlc3RhYmxpc2htZW50IHR5cGUgIkFkdWx0IHNlcnZpY2VzIiwgIkdlbmVyaWMvb3RoZXIgc2VydmljZXMiIBwAAExhdGVzdCB1cGRhdGUgZGF0ZSAgICAgICAgIC3nAABUaGUgbW9zdCByZWNlbnQgZGF0ZSB0aGUgd29ya3BsYWNlL3RlYW0gd2FzIHVwZGF0ZWQuCkJ1bGsgdXBsb2FkZXJzIC0gVGhlIGxhc3QgdGltZSB0aGUgd29ya3BsYWNlIHdhcyB1cGxvYWRlZCB3aXRoIHN0YXR1cyAiTkVXIiwiVVBEQVRFIiBvciAiTk8gQ0hBTkdFIi4KTm9uIEJ1bGsgdXBsb2FkZXJzIC0gdGhlIGxhc3QgdGltZSB0aGUgYWNjb3VudCB3YXMgYWNjZXNzZWQgYW5kIHNhdmVkL3VwZGF0ZWQmAABXb3JrcGxhY2UgbGV2ZWwgZmllbGRzIHRvIGJlIGNvbXBsZXRlZAkAAERhdGEgaXRlbQUAAE5vdGVzEgAARXN0YWJsaXNobWVudCB0eXBlDAAATWFpbiBzZXJ2aWNlFwAAU2VydmljZSB1c2VyIGdyb3VwIGRhdGFTAABBdCBsZWFzdCBvbmUgZ3JvdXAgbXVzdCBiZSBzZWxlY3RlZCAodW5sZXNzIG1haW4gc2VydmljZSBpcyAiaGVhZCBvZmZpY2Ugc2VydmljZXMiKRgAAENhcGFjaXR5IG9mIG1haW4gc2VydmljZUYAAE11c3QgYmUgZ3JlYXRlciB0aGFuIDAgKHVubGVzcyBtYWluIHNlcnZpY2UgZG9lcyBub3QgcmVxdWlyZSBjYXBhY2l0eSkbAABVdGlsaXNhdGlvbiBvZiBtYWluIHNlcnZpY2UPAABOdW1iZXIgb2Ygc3RhZmZJAABDYWxjdWxhdGVkIGJ5IGFkZGluZyB1cCBlYWNoIGluZGl2aWR1YWwgam9iIHJvbGUsIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAuEwAATnVtYmVyIG9mIHZhY2FuY2llczEAAE51bWJlciBvZiBlbXBsb3llZXMgbGVhdmluZyBpbiB0aGUgcGFzdCAxMiBtb250aHMyAABOdW1iZXIgb2YgZW1wbG95ZWVzIHN0YXJ0aW5nIGluIHRoZSBwYXN0IDEyIG1vbnRoc1gAAFdvcmtwbGFjZSBsZXZlbCBkYXRhIHdpbGwgYmUgZGVlbWVkIGNvbXBsZXRlIGlmIGFsbCBvZiB0aGVzZSBmaWVsZHMgaGF2ZSBiZWVuIGNvbXBsZXRlZC4zAABJbmRpdmlkdWFsIHN0YWZmIHJlY29yZHMgbGV2ZWwgZGF0YSB0byBiZSBjb21wbGV0ZWQGAABHZW5kZXINAABEYXRlIG9mIEJpcnRoDAAARXRobmljIGdyb3VwDQAATWFpbiBqb2Igcm9sZREAAEVtcGxveW1lbnQgc3RhdHVzEAAAQ29udHJhY3RlZCBob3Vyc24AAE11c3QgYmUgZ3JlYXRlciB0aGFuIDAgKHVubGVzcyB3b3JraW5nIGFycmFuZ2VtZW50cyBhcmUgMCBob3VycyBjb250cmFjdCwgZmxleGl0aW1lIG9yIHNvbWUgb3RoZXIgYXJyYW5nZW1lbnQpCAAAU2lja25lc3MDAABQYXk2AABNdXN0IGJlIGdyZWF0ZXIgdGhhbiAwICh1bmxlc3MgcGF5IGludGVydmFsIGlzIHVucGFpZCkTAABRdWFsaWZpY2F0aW9ucyBoZWxkfQAATXVzdCBoYXZlIGEgdmFsaWQgcXVhbGlmaWNpYXRpb24gb3IgaGF2ZSAnTm8gcXVhbGlmaWNhdGlvbnMgaGVsZCcgb3IgJ0Rvbid0IGtub3cgaWYgd29ya2VyIGhvbGRzIGFueSBxdWFsaWZpY2F0aW9ucycgc2VsZWN0ZWRBAQBBbiBpbmRpdmlkdWFsIHN0YWZmIHJlY29yZCB3aWxsIGJlIGRlZW1lZCBjb21wbGV0ZSBpZiBhbGwgcmVxdWlyZWQgZmllbGRzIGhhdmUgYmVlbiBjb21wbGV0ZWQuCkxvY2FsIGF1dGhvcml0aWVzIHNob3VsZCBjb21wbGV0ZSAgc3RhZmYgcmVjb3JkcyBmb3IgYXQgbGVhc3QgOTAlIG9mIHRoZWlyIG5vbi1hZ2VuY3kgc3RhZmYKQ2FsY3VsYXRlZDogbnVtYmVyIG9mIGNvbXBsZXRlIG5vbi1hZ2VuY3kgc3RhZmYgcmVjb3JkcyByZWNvcmRzIC8gbnVtYmVyIG9mIG5vbi1hZ2VuY3kgc3RhZmYgcmVjb3JkcyAoc2VlIHNoZWV0IDIgZm9yIGZ1cnRoZXIgZGV0YWlscykEAABEYXRlCgAAMjEvMDYvMjAxORQAAExvY2FsIGF1dGhvcml0eSBuYW1lCAAAS2lya2xlZXMLAABQYXJlbnQgbmFtZQ8AAFNraWxscyBmb3IgQ2FyZRQAAFdvcmtwbGFjZSBsZXZlbCBkYXRhHQAASW5kaXZpZHVhbCBzdGFmZiByZWNvcmRzIGRhdGEUAABXb3JrcGxhY2UvIHRlYW0gbmFtZQwAAFdvcmtwbGFjZSBJRBIAAExhdGVzdCB1cGRhdGUgZGF0ZRgAAFNlcnZpY2UgdXNlciBncm91cHMgZGF0YR0AAExlYXZlcnMgaW4gdGhlIHBhc3QgMTIgbW9udGhzKAAATnVtYmVyIG9mIHN0YXJ0ZXJzIGluIHRoZSBwYXN0IDEyIG1vbnRocxcAAE51bWJlciBvZiBzdGFmZiByZWNvcmRzJAAATnVtYmVyIG9mIHN0YWZmIHJlY29yZHMgKG5vdCBhZ2VuY3kpHgAATnVtYmVyIG9mIGFnZW5jeSBzdGFmZiByZWNvcmRzGAAAV29ya3BsYWNlIGRhdGEgY29tcGxldGU/IgAATnVtYmVyIG9mIGluZGl2aWR1YWwgc3RhZmYgcmVjb3JkcxsAAFBlcmNlbnRhZ2Ugb2Ygc3RhZmYgcmVjb3Jkcy0AAE51bWJlciBvZiBjb21wbGV0ZSBzdGFmZiByZWNvcmRzIChub3QgYWdlbmN5KSQAAFBlcmNlbnRhZ2Ugb2YgY29tcGxldGUgc3RhZmYgcmVjb3JkcycAAE51bWJlciBvZiBjb21wbGV0ZSBhZ2VuY3kgc3RhZmYgcmVjb3JkcysAAFBlcmNlbnRhZ2Ugb2YgY29tcGxldGUgYWdlbmN5IHN0YWZmIHJlY29yZHMFAABUb3RhbAMAAG4vYQoAADE5LzA2LzIwMTkHAABKMjQ2MjY3KwAAU3RhdHV0b3J5OiBsb2NhbCBhdXRob3JpdHkgKGFkdWx0IHNlcnZpY2VzKRQAAEhlYWQgb2ZmaWNlIHNlcnZpY2VzAgAATm8OAABHcmFjZSBTdHJlZXQgMgcAAEozMDQ3NjUKAAAwNC8wNi8yMDE5DgAAUHJpdmF0ZSBzZWN0b3IkAABPdGhlciBhZHVsdCByZXNpZGVudGlhbCBjYXJlIHNlcnZpY2UJAABDb21wbGV0ZWQMAABTdWJzaWRpYXJ5IDIHAABKMzA2MDQ1CgAAMTgvMDYvMjAxOR4AAENvbW11bml0eSBzdXBwb3J0IGFuZCBvdXRyZWFjaAwAAFN1YnNpZGlhcnkgMwcAAEozMDYwNDYRAABTaGVsdGVyZWQgaG91c2luZwsAAHJhY2hlbCBob21lBwAARzMyNjg1NigAAFNvY2lhbCB3b3JrIGFuZCBjYXJlIG1hbmFnZW1lbnQgKGFkdWx0cykHAABTdXBwb3J0BwAASjMzNDQzNgwAAEdyYWNlIFN0cmVldAcAAEUzMjk5MzcoAABEb21pY2lsaWFyeSBjYXJlIHNlcnZpY2VzIChBZHVsdHMpIC0gRENDCAAATG9jYWwgSUQVAABXb3JrcGxhY2UgLyB0ZWFtIG5hbWUNAABEYXRlIG9mIGJpcnRoGAAAQ29udHJhY3RlZC9BdmVyYWdlIGhvdXJzDQAAU2lja25lc3MgZGF5cwwAAFBheSBpbnRlcnZhbAsAAFJhdGUgb2YgcGF5JwAAUmVsZXZhbnQgc29jaWFsIGNhcmUgcXVhbGlmaWNhdGlvbiBoZWxkLwAASGlnaGVzdCBsZXZlbCBvZiBzb2NpYWwgY2FyZSBxdWFsaWZpY2F0aW9uIGhlbGQiAABOb24tc29jaWFsIGNhcmUgcXVhbGlmaWNhdGlvbiBoZWxkEAAATGFzdCB1cGRhdGUgZGF0ZRYAAFN0YWZmIHJlY29yZCBjb21wbGV0ZT8HAABUZXN0aW5nBAAATWFsZQoAADEzLzA0LzE5MzYFAABXaGl0ZTMAAE90aGVyIGpvYiByb2xlcyBkaXJlY3RseSBpbnZvbHZlZCBpbiBwcm92aWRpbmcgY2FyZRQAAFBlcm1hbmVudGx5IGVtcGxveWVkCQAATm90IEtub3duBgAASG91cmx5AwAATi9BCQAATm90IGtub3duBgAAUmFjaGVsBgAARmVtYWxlCgAAMjcvMDQvMTk4OB0AAEFkdmljZSwgR3VpZGFuY2UgYW5kIEFkdm9jYWN5AwAAWWVzBwAATGV2ZWwgMwsAAHJlZyBtYW5hZ2VyCgAAMDYvMTEvMTkyOREAAE1pZGRsZSBNYW5hZ2VtZW50BgAAQW5udWFsBQAAMTIzNDUKAAAwMy8wNS8xOTk5EgAARmlyc3QgTGluZSBNYW5hZ2VyBQAATk1EUzIKAAAwNC8xMC8xOTY0EAAAUmVnaXN0ZXJlZCBOdXJzZQcAAExldmVsIDQEAABkZW1vCgAAMDUvMTIvMjAwMgcAAE1pc3NpbmcDAAA0NTYKAAAwNi8wOC8xOTU3BQAAdGVzdDMKAAAwNC8xMS8xOTg1CwAAQ2FyZSBXb3JrZXIeAABUZW1wb3JhcmlseSBlbXBsb3llZCBvciBjYXN1YWwMAABsaW5raW5nIHRlc3QKAAAwNi8xMi8xOTY0BgAAdGVzdCAy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AwAAAABAAQ8ACAIQADEAAAAAAI0CAAAAAEABDwAIAhAAMgAAAAAANQUAAAAAQAEPAP0ACgAgAAEAGwAfAAAAvgAUACAAAgAbABsAGwAbABsAGwAbAAgA/QAKACIAAQAXACAAAAC+ABAAIgACABcAFwAXABcAFwAGAP0ACgAkAAEAGAARAAAAAQIGACQAAgAYAP0ACgAkAAMAGQASAAAAvgAUACQABAAZABkAGQAZABkAGQAZAAoA/QAKACUAAQAaACEAAAC+ABgAJQACABoAHAAcABwAHAAcABwAHAAcAAoA/QAKACYAAQAaACIAAAC+ABgAJgACABoAHAAcABwAHAAcABwAHAAcAAoA/QAKACcAAQAaACMAAAC+ABgAJwACABoAHAAcABwAHAAcABwAHAAcAAoA/QAKACgAAQAaACQAAAC+ABgAKAACABoAHAAcABwAHAAcABwAHAAcAAoA/QAKACkAAQAaACUAAAC+ABgAKQACABoAHAAcABwAHAAcABwAHAAcAAoA/QAKACoAAQAaACYAAAABAgYAKgACABoA/QAKACoAAwAaACcAAAC+ABQAKgAEABoAGgAaABoAGgAaABoACgD9AAoAKwABABoAKAAAAL4AGAArAAIAGgAaABoAGgAaABoAGgAaABoACgD9AAoALAABABoAKQAAAAECBgAsAAIAGgD9AAoALAADABoAKgAAAL4AFAAsAAQAGgAaABoAGgAaABoAGgAKAP0ACgAtAAEAGgArAAAAAQIGAC0AAgAaAP0ACgAtAAMAGgAsAAAAvgAUAC0ABAAaABoAGgAaABoAGgAaAAoA/QAKADAAAQAbAC0AAAC+ABYAMAACABsAGwAbABsAGwAbABsAGwAJAOUA0gE6AAEAAQAAAA8ABAAEAAEADQAFAAUAAQAEAAcABwACAAcACAAIAAIABwAJAAkAAgAHAAoACgACAAcADAAMAAEABAAOAA4AAQADAA4ADgAEAAsADwAPAAEAAwAPAA8ABAALABAAEAABAAMAEAAQAAQACwATABMAAQAGABUAFQABAAUAFQAVAAYACgAWABYAAQAFABYAFgAGAAoAFwAXAAEABQAXABcABgAKABgAGAABAAUAGAAYAAYACgAZABkAAQAFABkAGQAGAAoAGgAaAAEABQAaABoABgAKABsAGwABAAUAGwAbAAYACgAc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PwAAAP0ACgAKABAAIQBAAAAA/QAKAAoAEQAhAEEAAAD9AAoACgASACEAPQAAAP0ACgAKABMAIQBCAAAA/QAKAAoAFAAhAEMAAAD9AAoACgAVACEAPgAAAP0ACgAKABYAIQBEAAAA/QAKAAoAFwAhAEUAAAD9AAoACwAAACIARgAAAP0ACgALAAEAIwBHAAAA/QAKAAsAAgAkAEgAAAD9AAoACwAEACMARwAAAP0ACgALAAUAIwBHAAAA/QAKAAsABgAjAEcAAAD9AAoACwAHACUARwAAAP0ACgALAAgAJQBHAAAAvQAqAAsACQAjAAYAAAAjABYAAAAjAC4AAAAjAJIAAAAjAIYAAAAjAA4AAAAOAP0ACgALAA8AJABHAAAAfgIKAAsAEAAjADIAAAADAg4ACwARACYAq6qqqqqqQEC9ACoACwASACUAMgAAACMAAgAAACcAAgAAACgAAgAAACkAAgAAACcAAgAAABcA/QAKAAwAAAAqADMAAAD9AAoADAABACsASQAAAP0ACgAMAAIALABIAAAA/QAKAAwABAArAEoAAAD9AAoADAAFACsASwAAAP0ACgAMAAYAKwBHAAAA/QAKAAwABwAtAEcAAAD9AAoADAAIAC0ARwAAAL0AKgAMAAkAKwACAAAAKwACAAAAKwACAAAAKwAeAAAAKwAeAAAAKwACAAAADgD9AAoADAAPACwATAAAAH4CCgAMABAAKwASAAAAAwIOAAwAEQAuACRJkiRJkkxAvQASAAwAEgAtABIAAAArAA4AAAATAAMCDgAMABQALwDctm3btm1FQL0AGAAMABUAMAACAAAAMQACAAAAMgACAAAAFwD9AAoADQAAADMATQAAAP0ACgANAAEAIwBOAAAA/QAKAA0AAgA0AE8AAAD9AAoADQAEADUAUAAAAP0ACgANAAUAIwBRAAAA/QAKAA0ABgAjAFIAAAC9ADYADQAHADYAAgAAADYAAgAAACMAAgAAACMABgAAACMAAgAAACMABgAAACMABgAAACMAAgAAAA4A/QAKAA0ADwA0AEwAAAC9ADYADQAQACMABgAAACYAkgEAACUABgAAACMABgAAACcAkgEAACgAAgAAACkAAgAAACcAAgAAABcA/QAKAA4AAAAzAFMAAAD9AAoADgABACMAVAAAAP0ACgAOAAIANABVAAAA/QAKAA4A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AAAA/QAKAAkAEQAfAG0AAAD9AAoACgAAADMAbgAAAP0ACgAKAAEAIwBNAAAA/QAKAAoAAwAjAE4AAAD9AAoACgAEACMAbwAAAP0ACgAKAAUAIwBwAAAA/QAKAAoABgAjAHEAAAD9AAoACgAHACMAcgAAAP0ACgAKAAgAIwBzAAAAfgIKAAoACQAlAAIAAAD9AAoACgAKACUAdAAAAP0ACgAKAAsAIwB1AAAAfgIKAAoADABGALsLAAD9AAoACgANACMATAAAAP0ACgAKAA4AIwB2AAAA/QAKAAoADwAjAHcAAAD9AAoACgAQADUATwAAAP0ACgAKABEANABMAAAA/QAKAAsAAAAzAHgAAAD9AAoACwABACMAWgAAAP0ACgALAAMAIwBbAAAA/QAKAAsABAAjAHkAAAD9AAoACwAFACMAegAAAP0ACgALAAYAIwBxAAAA/QAKAAsABwAjAHsAAAD9AAoACwAIACMAcwAAAL0AEgALAAkAJQCiAAAAJQACAAAACgD9AAoACwALACMAdQAAAH4CCgALAAwARgB7KAAA/QAKAAsADQAjAHwAAAD9AAoACwAOACMAfQAAAP0ACgALAA8AIwB8AAAA/QAKAAsAEAA1AFUAAAD9AAoACwARADQATAAAAP0ACgAMAAAAMwB+AAAA/QAKAAwAAQAjADMAAAD9AAoADAADACMASQAAAP0ACgAMAAQAIwBvAAAA/QAKAAwABQAjAH8AAAD9AAoADAAGACMAdwAAAP0ACgAMAAcAIwCAAAAA/QAKAAwACAAjAHMAAAC9ABIADAAJACUAlgAAACUAAgAAAAoA/QAKAAwACwAjAIEAAAB+AgoADAAMAEYAAnECAP0ACgAMAA0AIwBMAAAA/QAKAAwADgAjAHYAAAD9AAoADAAPACMAdwAAAP0ACgAMABAANQBVAAAA/QAKAAwAEQA0AEwAAAD9AAoADQAAADMAggAAAP0ACgANAAEAIwAzAAAA/QAKAA0AAwAjAEkAAAD9AAoADQAEACMAeQAAAP0ACgANAAUAIwCDAAAA/QAKAA0ABgAjAHcAAAD9AAoADQAHACMAhAAAAP0ACgANAAgAIwBzAAAAvQASAA0ACQAlAAIAAAAlAMsAAAAKAP0ACgANAAsAIwB1AAAAfgIKAA0ADABGACoAAAD9AAoADQANACMATAAAAP0ACgANAA4AIwB2AAAA/QAKAA0ADwAjAHwAAAD9AAoADQAQADUAVQAAAP0ACgANABEANABMAAAA/QAKAA4AAAAzAIUAAAD9AAoADgABACMAMwAAAP0ACgAOAAMAIwBJAAAA/QAKAA4ABAAjAHkAAAD9AAoADgAFACMAhgAAAP0ACgAOAAYAIwB3AAAA/QAKAA4ABwAjAIcAAAD9AAoADgAIACMAcwAAAL0AEgAOAAkAJQCSAAAAJQAGAAAACgD9AAoADgALACMAdQAAAH4CCgAOAAwARgAqAAAA/QAKAA4ADQAjAHwAAAD9AAoADgAOACMAiAAAAP0ACgAOAA8AIwB8AAAA/QAKAA4AEAA1AEgAAAD9AAoADgARADQATAAAAP0ACgAPAAAAMwCJAAAA/QAKAA8AAQAjADMAAAD9AAoADwADACMASQAAAP0ACgAPAAQAIwB0AAAA/QAKAA8ABQAjAIoAAAD9AAoADwAGADUAiwAAAP0ACgAPAAcAIwCAAAAA/QAKAA8ACAA1AIsAAAD9AAoADwAJADYAiwAAAP0ACgAPAAoANgCLAAAA/QAKAA8ACwA1AIsAAAB+AgoADwAMAEcAAgAAAP0ACgAPAA0ANQCLAAAA/QAKAA8ADgA1AIsAAAD9AAoADwAPADUAiwAAAP0ACgAPABAANQBVAAAA/QAKAA8AEQA0AEwAAAD9AAoAEAAAADMAjAAAAP0ACgAQAAEAIwBTAAAA/QAKABAAAwAjAFQAAAD9AAoAEAAEACMAbwAAAP0ACgAQAAUAIwCNAAAA/QAKABAABgAjAHEAAAD9AAoAEAAHACMAhAAAAP0ACgAQAAgAIwBzAAAAvQASABAACQAlAIoAAAAlAAIAAAAKAP0ACgAQAAsAIwCBAAAAfgIKABAADABGAII4AQD9AAoAEAANACMAfAAAAP0ACgAQAA4AIwB9AAAA/QAKABAADwAjAEwAAAD9AAoAEAAQADUAVQAAAP0ACgAQABEANABMAAAA/QAKABEAAAAzAI4AAAD9AAoAEQABACMAUwAAAP0ACgARAAMAIwBUAAAA/QAKABEABAAjAHkAAAD9AAoAEQAFACMAjwAAAP0ACgARAAYAIwB3AAAA/QAKABEABwAjAJAAAAD9AAoAEQAIACMAkQAAAL0AEgARAAkAJQBSAAAAJQACAAAACgD9AAoAEQALACMAdQAAAH4CCgARAAwARgBnDQAA/QAKABEADQAjAHwAAAD9AAoAEQAOACMAfQAAAP0ACgARAA8AIwB3AAAA/QAKABEAEAA1AFUAAAD9AAoAEQARADQATAAAAP0ACgASAAAAMwCSAAAA/QAKABIAAQAjAFMAAAD9AAoAEgADACMAVAAAAP0ACgASAAQAIwB0AAAA/QAKABIABQAjAJMAAAD9AAoAEgAGACMAdwAAAP0ACgASAAcAIwCQAAAA/QAKABIACAAjAHMAAAD9AAoAEgAJADYAiwAAAP0ACgASAAoAJQB0AAAA/QAKABIACwAjAHUAAAB+AgoAEgAMAEYASw0AAP0ACgASAA0AIwBMAAAA/QAKABIADgAjAHYAAAD9AAoAEgAPACMAdwAAAP0ACgASABAANQBVAAAA/QAKABIAEQA0AEwAAAD9AAoAEwAAADMAlAAAAP0ACgATAAEAIwBTAAAA/QAKABMAAwAjAFQAAAD9AAoAEwAEACMAeQAAAP0ACgATAAUAIwCVAAAA/QAKABMABgAjAHEAAAD9AAoAEwAHACMAhwAAAP0ACgATAAgAIwCRAAAAvQASABMACQAlAGYAAAAlABYAAAAKAP0ACgATAAsAIwB1AAAAfgIKABMADABGAH8KAAD9AAoAEwANACMAfAAAAP0ACgATAA4AIwCIAAAA/QAKABMADwAjAHcAAAD9AAoAEwAQADUAVQAAAP0ACgATABEANABMAAAA/QAKABQAAAAzAJYAAAD9AAoAFAABACMAVwAAAP0ACgAUAAMAIwBYAAAA/QAKABQABAAjAHkAAAD9AAoAFAAFACMAlwAAAP0ACgAUAAYAIwB3AAAA/QAKABQABwAjAIcAAAD9AAoAFAAIACMAmAAAAL0AEgAUAAkAJQCWAAAAJQACAAAACgD9AAoAFAALACMAdQAAAH4CCgAUAAwARgAmAAAA/QAKABQADQAjAEwAAAD9AAoAFAAOACMAdgAAAP0ACgAUAA8AIwB3AAAA/QAKABQAEAA1AFUAAAD9AAoAFAARADQATAAAAP0ACgAVAAAAOQCZAAAA/QAKABUAAQA6AF0AAAABAgYAFQACADwA/QAKABUAAwA6AF4AAAD9AAoAFQAEADoAeQAAAP0ACgAVAAUAOgCaAAAA/QAKABUABgA6AHEAAAD9AAoAFQAHADoAhAAAAP0ACgAVAAgAOgCbAAAAvQASABUACQBAAAIAAABAAAIAAAAKAP0ACgAVAAsAOgCcAAAAfgIKABUADABIAAIAAAD9AAoAFQANADoAfAAAAP0ACgAVAA4AOgB9AAAA/QAKABUADwA6AHwAAAD9AAoAFQAQAD0AVQAAAP0ACgAVABEAOwBMAAAA5QAKAAEAAQABAAAAEwDsAFAADwAC8EgAAAAwAAjwCAAAAAEAAAAADAAADwAD8DAAAAAPAATwKAAAAAEACfAQAAAAAAAAAAAAAAAAAAAAAAAAAAIACvAIAAAAAAwAAAUAAAA+AhIAvAEAAAAAQAAAAAAAAAAAAAAAQQAKAAAAAwADAAAAAgAdAA8AAwAAAAAAAAEAAAAAAAAAHQAPAAIMAAsAAAABAAwADAALC2cIFwBnCAAAAAAAAAAAAAACAAH/////AAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAP7////+////BAAAAAUAAAD+////BwAAAAgAAAAJAAAA/v////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8BAP7/AwoAAP////8QCAIAAAAAAMAAAAAAAABGGwAAAE1pY3Jvc29mdCBFeGNlbCA5Ny1UYWJlbGxlAAYAAABCaWZmOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/wAAAQACAAAAAAAAAAAAAAAAAAAAAAABAAAA4IWf8vlPaBCrkQgAKyez2TAAAAB8AAAABgAAAAEAAAA4AAAACQAAAEAAAAAKAAAATAAAAAsAAABYAAAADAAAAGQAAAANAAAAcAAAAAIAAADp/QAAHgAAAAIAAAAwAAAAQAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAADjh2gjKNUBQAAAAAAuW0PrTdUBAAAAAAAAAAAAAAAAAAAAAAAAAAD+/wAAAQACAAAAAAAAAAAAAAAAAAAAAAACAAAAAtXN1ZwuGxCTlwgAKyz5rkQAAAAF1c3VnC4bEJOXCAArLPmuXAAAABgAAAABAAAAAQAAABAAAAACAAAA6f0AAHgAAAADAAAAAAAAACAAAAABAAAAPAAAAAIAAABEAAAAAQAAAAIAAAAOAAAAQ29udGVudFR5cGVJZAAAAAIAAADp/QAAHgAAACwAAAAweDAxMDEwMEUxODAyQzBDQkI4QkU4NEQ4OTMwM0ZGNjUxRkRGRkIxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUgBvAG8AdAAgAEUAbgB0AHIAeQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYABQD//////////wEAAAAQCAIAAAAAAMAAAAAAAABGAAAAAAAAAAAAAAAAAAAAAAAAAAAqAAAAgAIAAAAAAABXAG8AcgBrAGIAbwBvAGsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgACAAIAAAAEAAAA/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAoTAAAAAAAAAEAQwBvAG0AcABPAGIAagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAIAAwAAAP//////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEkAAAAAAAAAAQBPAGwAZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAgD///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAFAAAAAAAAAAFAFMAdQBtAG0AYQByAHkASQBuAGYAbwByAG0AYQB0AGkAbwBuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAACAP////8FAAAA/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAACsAAAAAAAAAAUARABvAGMAdQBtAGUAbgB0AFMAdQBtAG0AYQByAHkASQBuAGYAbwByAG0AYQB0AGkAbwBuAAAAAAAAAAAAAAA4AAIA////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAANQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7///8AAAAAAAAAAA==';

// gets report
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishment.id;

  console.log("WA DEBUG - report/localAuthority/user:establishmentId - ", establishmentId)

  try {

    // first ensure this report can only be ran by those establishments with a Local Authority employer type
    const thisEstablishment = new Establishment(req.username);
    if (await thisEstablishment.restore(establishmentId,false)) {

      const theEmployerType = thisEstablishment.employerType;

      console.log("WA DEBUG - employer type - ", theEmployerType)

      if (theEmployerType && (theEmployerType.value).startsWith('Local Authority')) {
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-disposition', 'attachment; filename=' + `${date}-sfc-wdf-summary-report.csv`);
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Length', EXAMPLE_XLS_FILE.length);

        // the data is already BASE64 encoded
        return res.status(200).end(EXAMPLE_XLS_FILE);

      } else {
        // only allow on those establishments being a local authority
        return res.status(403).send();
      }


    } else {
      console.error('report/localAuthority/user - failed restoring establisment', err);
      return res.status(503).send('ERR: Failed to retrieve report');
    }

  } catch (err) {
    console.error('report/localAuthority/user - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
});

module.exports = router;
