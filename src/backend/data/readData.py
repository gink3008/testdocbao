# with open("/home/hiep/Project/Predict/docbao/src/backend/data/article.dat",encoding='utf-8') as f:
#     data = f.read()
#     print(data)
import codecs

path = "/home/hiep/Project/Predict/docbao/src/backend/data/article.dat"
# content = open(path, encoding= 'uft-16').read()
with codecs.open(path, "rb") as f:
    contents = f.read()
print(contents)