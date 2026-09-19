import os,tempfile
_unlink=os.unlink
def safe(path,*a,**k):
    try:return _unlink(path,*a,**k)
    except PermissionError as e:
        if getattr(e,"winerror",None)==32 and os.path.commonpath([os.path.abspath(tempfile.gettempdir()),os.path.abspath(path)])==os.path.abspath(tempfile.gettempdir()):return None
        raise
os.unlink=safe
