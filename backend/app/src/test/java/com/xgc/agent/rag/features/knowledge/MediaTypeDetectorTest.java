package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.detect.MediaTypeDetector;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MediaTypeDetectorTest {

    private final MediaTypeDetector detector = new MediaTypeDetector();

    @Test
    void pngMagic_isPng() {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0
        };
        assertThat(detector.detectAllowed(png, "a.png")).isEqualTo("image/png");
    }

    @Test
    void markdownFilename_withOctetLikeBytes_isMarkdown() {
        byte[] body = "# hello\n".getBytes(StandardCharsets.UTF_8);
        assertThat(detector.detectAllowed(body, "note.md")).isEqualTo("text/markdown");
    }

    @Test
    void exeMagic_rejected() {
        byte[] mz = new byte[] {'M', 'Z', 0, 0, 0, 0};
        assertThatThrownBy(() -> detector.detectAllowed(mz, "tool.exe"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED.code());
    }
}
