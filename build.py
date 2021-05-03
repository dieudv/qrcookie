import http.client, json, os, zipfile, cssmin, sys
from urllib.parse import urlencode
from shutil import copyfile
from htmlmin import minify


def json_compiler(input_file, output_file):
    file_data = open(input_file, "r", encoding="utf-8").read()
    json_data = json.loads(file_data)
    json_string = json.dumps(json_data, separators=(',', ":"))
    open(output_file, "w", encoding="utf-8").write(json_string)


def html_minify(input_file, output_file):
    content = open(input_file, "r").read()
    minified_content = minify(content, remove_comments=True, remove_empty_space=True, remove_all_empty_space=True)
    open(output_file, "w", encoding="utf-8").write(minified_content)


def css_minify(input_file, output_file):
    output = cssmin.cssmin(open(input_file).read())
    open(output_file, "w", encoding="utf-8").write(output)


def closure_compiler(input_file, output_file):
    content = open(input_file, "r").read()

    params = urlencode([
        ('js_code', content),
        ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
        ('output_format', 'text'),
        ('output_info', 'compiled_code'),
    ])

    headers = { "Content-type": "application/x-www-form-urlencoded" }
    conn = http.client.HTTPSConnection('closure-compiler.appspot.com')
    conn.request('POST', '/compile', params, headers)
    response = conn.getresponse()
    data = response.read()
    conn.close()

    open(output_file, "wb").write(data)


def obfuscate(input_file, output_file):
    os.system(f"javascript-obfuscator {input_file} --output {output_file} --config ./obfsctr-cfg.json")


def zipfolder(foldername, target_dir):
    zipobj = zipfile.ZipFile(foldername + '.zip', 'w', zipfile.ZIP_DEFLATED)
    rootlen = len(target_dir)
    for base, dirs, files in os.walk(target_dir):
        for file in files:
            fn = os.path.join(base, file)
            zipobj.write(fn, fn[rootlen:])


if __name__ == "__main__":

    mode = "debug"
    browser = "chrome"

    if sys.argv[1] in ['debug', 'release']:
        mode = sys.argv[1]

    if sys.argv[2] in ['chrome', 'firefox', 'edge', 'web']:
        browser = sys.argv[2]

    if mode == "debug":
        copyfile("./manifest.json",f"./build/{mode}/manifest.json")
    else:
        with open("manifest.json") as manifest:
            json_data = json.load(manifest)
            json_string = json.dumps(json_data, separators=(",", ":"))
            open(f"./build/{mode}/manifest.json", "w", encoding="utf-8").write(json_string)

    print("Copying icons ...")
    copyfile("./ic/ic16.png",f"./build/{mode}/ic/ic16.png")
    copyfile("./ic/ic32.png",f"./build/{mode}/ic/ic32.png")
    copyfile("./ic/ic48.png",f"./build/{mode}/ic/ic48.png")
    copyfile("./ic/ic128.png",f"./build/{mode}/ic/ic128.png")

    print("Compling json ...")
    if mode == "debug":
        copyfile("./_locales/en/messages.json",f"./build/{mode}/_locales/en/messages.json")
    else:
        json_compiler("./_locales/en/messages.json",f"./build/{mode}/_locales/en/messages.json")

    print("Minfy html ...")
    if mode == "debug":
        copyfile("./popup.html", f"./build/{mode}/popup-tmp.html")
    else:
        html_minify("./popup.html", f"./build/{mode}/popup-tmp.html")

    print("Fix &nbsp; in html ...")
    with open(f"./build/{mode}/popup-tmp.html", "rt") as fin:
        with open(f"./build/{mode}/popup.html", "wt") as fout:
            for line in fin:
                if mode == "debug":
                    fout.write(line.replace('&nbsp;', ''))
                else:
                    fout.write(line.replace('&nbsp; ', '&nbsp;'))
    os.remove(f"./build/{mode}/popup-tmp.html")

    print("Minify css ...")
    if mode == "debug":
        copyfile("./style.css",f"./build/{mode}/style.css")
    else:
        css_minify("./style.css",f"./build/{mode}/style.css")

    print("Compling javascript ...")
    if mode == "debug":
        copyfile("./js/popup.js",f"./build/{mode}/js/popup.js")
        copyfile("./js/background.js",f"./build/{mode}/js/background.js")
        copyfile("./js/base.js",f"./build/{mode}/js/base.js")
        copyfile("./js/qrcode.min.js",f"./build/{mode}/js/qrcode.min.js")
    else:
        obfuscate("./js/popup.js",f"./build/{mode}/js/popup.js")
        obfuscate("./js/background.js",f"./build/{mode}/js/background.js")
        obfuscate("./js/base.js",f"./build/{mode}/js/base.js")
        copyfile("./js/qrcode.min.js",f"./build/{mode}/js/qrcode.min.js")

    print("Zip folder")
    if mode == "release":
        zipfolder(f'./build/qr-cookie', f'./build/{mode}/')

    print("DONE!")