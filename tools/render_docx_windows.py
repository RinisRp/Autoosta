from pathlib import Path
import argparse
import shutil
import subprocess
import tempfile

from pdf2image import convert_from_path


ROOT = Path(__file__).resolve().parents[1]
SOFFICE = Path(r"C:\Program Files\LibreOffice\program\soffice.com")
POPLER_BIN = Path(
    r"C:\Users\rinal\AppData\Local\Microsoft\WinGet\Packages"
    r"\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\poppler-25.07.0\Library\bin"
)


def file_uri(path: Path) -> str:
    return "file:///" + path.resolve().as_posix()


def convert_docx_to_pdf(docx_path: Path, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="lo-profile-") as profile_dir:
        command = [
            str(SOFFICE),
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            "--norestore",
            "--nodefault",
            "--nolockcheck",
            f"-env:UserInstallation={file_uri(Path(profile_dir))}",
            "--convert-to",
            "pdf",
            "--outdir",
            str(out_dir),
            str(docx_path.resolve()),
        ]
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(
                "LibreOffice conversion failed.\n"
                f"stdout:\n{result.stdout}\n"
                f"stderr:\n{result.stderr}"
            )

    pdf_path = out_dir / f"{docx_path.stem}.pdf"
    if not pdf_path.exists() or pdf_path.stat().st_size == 0:
        raise RuntimeError(f"LibreOffice did not create PDF: {pdf_path}")
    return pdf_path


def render_pdf_to_pngs(pdf_path: Path, out_dir: Path, dpi: int) -> list[Path]:
    raw_paths = convert_from_path(
        str(pdf_path),
        dpi=dpi,
        fmt="png",
        output_folder=str(out_dir),
        output_file="page",
        paths_only=True,
        thread_count=1,
        poppler_path=str(POPLER_BIN),
    )
    rendered = []
    for index, raw_path in enumerate(raw_paths, start=1):
        target = out_dir / f"page-{index}.png"
        shutil.move(raw_path, target)
        rendered.append(target)
    return rendered


def render_docx(docx_path: Path, output_dir: Path, dpi: int) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = convert_docx_to_pdf(docx_path, output_dir)
    return render_pdf_to_pngs(pdf_path, output_dir, dpi)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_path")
    parser.add_argument("--output_dir", required=True)
    parser.add_argument("--dpi", type=int, default=120)
    args = parser.parse_args()

    docx_path = Path(args.input_path)
    output_dir = Path(args.output_dir)
    pages = render_docx(docx_path, output_dir, args.dpi)
    print(f"Rendered {docx_path} -> {output_dir} ({len(pages)} pages)")


if __name__ == "__main__":
    main()
