import os

def get_directory_structure(rootdir):
    """
    Creates a nested dictionary that represents the folder structure of rootdir
    """
    dir_structure = {}
    rootdir = os.path.abspath(rootdir)
    for dirpath, dirnames, filenames in os.walk(rootdir):
        folder = dirpath.replace(rootdir, "").strip(os.sep)
        subdir = dir_structure
        if folder:
            for key in folder.split(os.sep):
                subdir = subdir.setdefault(key, {})
        for dirname in dirnames:
            subdir[dirname] = {}
        for filename in filenames:
            subdir[filename] = None
    return dir_structure

def write_structure_to_file(directory_structure, filepath):
    """
    Writes the directory structure to a text file
    """
    with open(filepath, 'w', encoding='utf-8') as f:
        def write_dict(d, indent=0):
            for key, value in d.items():
                f.write('    ' * indent + str(key) + '\n')
                if isinstance(value, dict):
                    write_dict(value, indent + 1)
        write_dict(directory_structure)

if __name__ == "__main__":
    current_directory = os.getcwd()
    structure = get_directory_structure(current_directory)
    output_file = "directory_structure.txt"
    write_structure_to_file(structure, output_file)
    print(f"Directory structure has been written to {output_file}")
