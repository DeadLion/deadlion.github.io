---
title: 'springmvc detect device type'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720150811
tags:
    - java
    - web
---

项目中有些页面需要检测访问来源是移动端还是pc端
之前做过前端js判断的，通过useragent里的关键字来判断，后端判断的话应该也差不多。果然网上看了看也都是基于这些原理，然后看到有个 spring mobile 项目，比较好奇他们是怎么做的。于是就去看了下源码。
源码如下：

LiteDeviceResolver.class

```
/*
 * Copyright 2010-2014 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.mobile.device;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

/**
 * A "lightweight" device resolver algorithm based on Wordpress's Mobile pack. Detects the
 * presence of a mobile device and works for a large percentage of mobile browsers. Does
 * not perform any device capability mapping, if you need that consider WURFL.
 * 
 * The code is based primarily on a list of approximately 90 well-known mobile browser UA
 * string snippets, with a couple of special cases for Opera Mini, the W3C default
 * delivery context and certain other Windows browsers. The code also looks to see if the
 * browser advertises WAP capabilities as a hint.
 * 
 * Tablet resolution is also performed based on known tablet browser UA strings. Android
 * tablets are detected based on <a href=
 * "http://googlewebmastercentral.blogspot.com/2011/03/mo-better-to-also-detect-mobile-user.html"
 * >Google's recommendations</a>.
 * 
 * @author Keith Donald
 * @author Roy Clarkson
 * @author Scott Rossillo
 * @author Yuri Mednikov
 * @author Onur Kagan Ozcan
 */
public class LiteDeviceResolver implements DeviceResolver {

	private final List<String> mobileUserAgentPrefixes = new ArrayList<String>();

	private final List<String> mobileUserAgentKeywords = new ArrayList<String>();

	private final List<String> tabletUserAgentKeywords = new ArrayList<String>();

	private final List<String> normalUserAgentKeywords = new ArrayList<String>();

	public LiteDeviceResolver() {
		init();
	}

	public LiteDeviceResolver(List<String> normalUserAgentKeywords) {
		init();
		this.normalUserAgentKeywords.addAll(normalUserAgentKeywords);
	}

	public Device resolveDevice(HttpServletRequest request) {
		String userAgent = request.getHeader("User-Agent");
		// UserAgent keyword detection of Normal devices
		if (userAgent != null) {
			userAgent = userAgent.toLowerCase();
			for (String keyword : normalUserAgentKeywords) {
				if (userAgent.contains(keyword)) {
					return resolveFallback(request);
				}
			}
		}
		// UserAgent keyword detection of Tablet devices
		if (userAgent != null) {
			userAgent = userAgent.toLowerCase();
			// Android special case
			if (userAgent.contains("android") && !userAgent.contains("mobile")) {
				return resolveWithPlatform(DeviceType.TABLET, DevicePlatform.ANDROID);
			}
			// Apple special case
			if (userAgent.contains("ipad")) {
				return resolveWithPlatform(DeviceType.TABLET, DevicePlatform.IOS);
			}
			// Kindle Fire special case
			if (userAgent.contains("silk") && !userAgent.contains("mobile")) {
				return resolveWithPlatform(DeviceType.TABLET, DevicePlatform.UNKNOWN);
			}
			for (String keyword : tabletUserAgentKeywords) {
				if (userAgent.contains(keyword)) {
					return resolveWithPlatform(DeviceType.TABLET, DevicePlatform.UNKNOWN);
				}
			}
		}
		// UAProf detection
		if (request.getHeader("x-wap-profile") != null || request.getHeader("Profile") != null) {
			if (userAgent != null) {
				// Android special case
				if (userAgent.contains("android")) {
					return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.ANDROID);
				}
				// Apple special case
				if (userAgent.contains("iphone") || userAgent.contains("ipod") || userAgent.contains("ipad")) {
					return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.IOS);
				}
			}
			return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.UNKNOWN);
		}
		// User-Agent prefix detection
		if (userAgent != null && userAgent.length() >= 4) {
			String prefix = userAgent.substring(0, 4).toLowerCase();
			if (mobileUserAgentPrefixes.contains(prefix)) {
				return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.UNKNOWN);
			}
		}
		// Accept-header based detection
		String accept = request.getHeader("Accept");
		if (accept != null && accept.contains("wap")) {
			return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.UNKNOWN);
		}
		// UserAgent keyword detection for Mobile devices
		if (userAgent != null) {
			// Android special case
			if (userAgent.contains("android")) {
				return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.ANDROID);
			}
			// Apple special case
			if (userAgent.contains("iphone") || userAgent.contains("ipod") || userAgent.contains("ipad")) {
				return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.IOS);
			}
			for (String keyword : mobileUserAgentKeywords) {
				if (userAgent.contains(keyword)) {
					return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.UNKNOWN);
				}
			}
		}
		// OperaMini special case
		@SuppressWarnings("rawtypes")
		Enumeration headers = request.getHeaderNames();
		while (headers.hasMoreElements()) {
			String header = (String) headers.nextElement();
			if (header.contains("OperaMini")) {
				/*return LiteDevice.MOBILE_INSTANCE;*/
				return resolveWithPlatform(DeviceType.MOBILE, DevicePlatform.UNKNOWN);
			}
		}
		return resolveFallback(request);
	}

	// subclassing hooks

	/**
	 * Wrapper method for allow subclassing platform based resolution
	 */
	protected Device resolveWithPlatform(DeviceType deviceType, DevicePlatform devicePlatform) {
		return LiteDevice.from(deviceType, devicePlatform);
	}

	/**
	 * List of user agent prefixes that identify mobile devices. Used primarily to match
	 * by operator or handset manufacturer.
	 */
	protected List<String> getMobileUserAgentPrefixes() {
		return mobileUserAgentPrefixes;
	}

	/**
	 * List of user agent keywords that identify mobile devices. Used primarily to match
	 * by mobile platform or operating system.
	 */
	protected List<String> getMobileUserAgentKeywords() {
		return mobileUserAgentKeywords;
	}

	/**
	 * List of user agent keywords that identify tablet devices. Used primarily to match
	 * by tablet platform or operating system.
	 */
	protected List<String> getTabletUserAgentKeywords() {
		return tabletUserAgentKeywords;
	}

	/**
	 * List of user agent keywords that identify normal devices. Any items in this list
	 * take precedence over the mobile and tablet user agent keywords, effectively
	 * overriding those.
	 */
	protected List<String> getNormalUserAgentKeywords() {
		return normalUserAgentKeywords;
	}

	/**
	 * Initialize this device resolver implementation. Registers the known set of device
	 * signature strings. Subclasses may override to register additional strings.
	 */
	protected void init() {
		getMobileUserAgentPrefixes().addAll(
				Arrays.asList(KNOWN_MOBILE_USER_AGENT_PREFIXES));
		getMobileUserAgentKeywords().addAll(
				Arrays.asList(KNOWN_MOBILE_USER_AGENT_KEYWORDS));
		getTabletUserAgentKeywords().addAll(
				Arrays.asList(KNOWN_TABLET_USER_AGENT_KEYWORDS));
	}

	/**
	 * Fallback called if no mobile device is matched by this resolver. The default
	 * implementation of this method returns a "normal" {@link Device} that is neither
	 * mobile or a tablet. Subclasses may override to try additional mobile or tablet
	 * device matching before falling back to a "normal" device.
	 */
	protected Device resolveFallback(HttpServletRequest request) {
		return LiteDevice.NORMAL_INSTANCE;
	}

	// internal helpers

	private static final String[] KNOWN_MOBILE_USER_AGENT_PREFIXES = new String[] {
			"w3c ", "w3c-", "acs-", "alav", "alca", "amoi", "audi", "avan", "benq",
			"bird", "blac", "blaz", "brew", "cell", "cldc", "cmd-", "dang", "doco",
			"eric", "hipt", "htc_", "inno", "ipaq", "ipod", "jigs", "kddi", "keji",
			"leno", "lg-c", "lg-d", "lg-g", "lge-", "lg/u", "maui", "maxo", "midp",
			"mits", "mmef", "mobi", "mot-", "moto", "mwbp", "nec-", "newt", "noki",
			"palm", "pana", "pant", "phil", "play", "port", "prox", "qwap", "sage",
			"sams", "sany", "sch-", "sec-", "send", "seri", "sgh-", "shar", "sie-",
			"siem", "smal", "smar", "sony", "sph-", "symb", "t-mo", "teli", "tim-",
			"tosh", "tsm-", "upg1", "upsi", "vk-v", "voda", "wap-", "wapa", "wapi",
			"wapp", "wapr", "webc", "winw", "winw", "xda ", "xda-" };

	private static final String[] KNOWN_MOBILE_USER_AGENT_KEYWORDS = new String[] {
			"blackberry", "webos", "ipod", "lge vx", "midp", "maemo", "mmp", "mobile",
			"netfront", "hiptop", "nintendo DS", "novarra", "openweb", "opera mobi",
			"opera mini", "palm", "psp", "phone", "smartphone", "symbian", "up.browser",
			"up.link", "wap", "windows ce" };

	private static final String[] KNOWN_TABLET_USER_AGENT_KEYWORDS = new String[] {
			"ipad", "playbook", "hp-tablet", "kindle" };

}

```


还是比较简单的，源码中做的比较细致，判断了设备类型等等，spring mobile 项目可以做功能肯定不只这些咯。
但是我也用不上，我就需要简单的判断下是不是移动端的就行了。然后我根据源码修改了下，以满足自己的需求。如果后期需要判断具体的设备类型也比较好扩展的。

DeviceTypeUtils.class

```
package utils;

import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

/**
 * 判断是否为移动设备访问
 * 
 * @author zhongjian
 * 
 */
public class DeviceTypeUtils {

	private static final String[] KNOWN_MOBILE_USER_AGENT_PREFIXES = new String[] { "w3c ", "w3c-",
			"acs-", "alav", "alca", "amoi", "audi", "avan", "benq", "bird", "blac", "blaz", "brew",
			"cell", "cldc", "cmd-", "dang", "doco", "eric", "hipt", "htc_", "inno", "ipaq", "ipod",
			"jigs", "kddi", "keji", "leno", "lg-c", "lg-d", "lg-g", "lge-", "lg/u", "maui", "maxo",
			"midp", "mits", "mmef", "mobi", "mot-", "moto", "mwbp", "nec-", "newt", "noki", "palm",
			"pana", "pant", "phil", "play", "port", "prox", "qwap", "sage", "sams", "sany", "sch-",
			"sec-", "send", "seri", "sgh-", "shar", "sie-", "siem", "smal", "smar", "sony", "sph-",
			"symb", "t-mo", "teli", "tim-", "tosh", "tsm-", "upg1", "upsi", "vk-v", "voda", "wap-",
			"wapa", "wapi", "wapp", "wapr", "webc", "winw", "winw", "xda ", "xda-" };

	/**
	 * 包含平板设备
	 */
	private static final String[] KNOWN_MOBILE_USER_AGENT_KEYWORDS = new String[] { "android",
			"ipad", "silk", "iphone", "wap", "blackberry", "webos", "ipod", "lge vx", "midp",
			"maemo", "mmp", "mobile", "netfront", "hiptop", "nintendo DS", "novarra", "openweb",
			"opera mobi", "opera mini", "palm", "psp", "phone", "smartphone", "symbian",
			"up.browser", "up.link", "wap", "windows ce", "playbook", "hp-tablet", "kindle" };

	private static List<String> mobileUserAgentPrefixes = Arrays
			.asList(KNOWN_MOBILE_USER_AGENT_PREFIXES);

	private static List<String> mobileUserAgentKeywords = Arrays
			.asList(KNOWN_MOBILE_USER_AGENT_KEYWORDS);

	public static boolean isMobile(HttpServletRequest request) {
		String userAgent = request.getHeader("User-Agent").toLowerCase();
		System.out.println(userAgent);

		for (String keyword : mobileUserAgentKeywords) {
			if (userAgent.contains(keyword)) {
				return true;
			}
		}

		if (userAgent != null && userAgent.length() >= 4) {
			String prefix = userAgent.substring(0, 4).toLowerCase();
			if (mobileUserAgentPrefixes.contains(prefix)) {
				return true;
			}

		}

		return false;
	}
}

```


